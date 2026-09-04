# Agent Message Navigator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Codex-style left navigation rail that previews and jumps to earlier user requests in long Agent conversations.

**Architecture:** Derive navigation items from the same `visibleMessageBlocks` array passed to `react-virtuoso`, so every target index stays aligned with the virtual list. A focused navigator component renders the rail; `AgentMessages` owns visible-range state, the Virtuoso handle, and suspension of bottom-follow when a historical target is selected.

**Tech Stack:** React 19, TypeScript, react-virtuoso 4.18, Radix UI, CSS, i18next.

## Global Constraints

- Navigate only user messages; do not add markers for Agent, tool, reasoning, status, or node blocks.
- Show the rail only when at least two visible user messages exist.
- Hide the rail at the existing mobile breakpoint of `767px`.
- Do not modify editor line-number behavior.
- Do not add settings, backend APIs, persistence, dependencies, unit tests, or E2E tests.
- Verify only with type-check, lint, build, and one manual multi-round conversation walkthrough.
- Preserve the user's untracked `docs/develop/feature-map.md` and all unrelated work.

---

## File Structure

- `frontend/src/features/assistant/components/agent/agent-message-navigation.ts`: pure extraction, plain-text preview, and active-item calculations.
- `frontend/src/features/assistant/components/agent/agent-message-navigator.tsx`: accessible rail buttons and hover previews.
- `frontend/src/features/assistant/components/agent/agent-messages.tsx`: Virtuoso integration and bottom-follow coordination.
- `frontend/src/features/assistant/components/agent/agent-message-blocks.css`: fixed rail layout, marker states, popover, and responsive hiding.
- `frontend/src/i18n/locales/zh-CN.json`: Chinese fallback and accessible label.
- `frontend/src/i18n/locales/en.json`: English fallback and accessible label.

---

### Task 1: Build navigation data and rail presentation

**Files:**
- Create: `frontend/src/features/assistant/components/agent/agent-message-navigation.ts`
- Create: `frontend/src/features/assistant/components/agent/agent-message-navigator.tsx`
- Modify: `frontend/src/features/assistant/components/agent/agent-message-blocks.css`
- Modify: `frontend/src/i18n/locales/zh-CN.json`
- Modify: `frontend/src/i18n/locales/en.json`

**Interfaces:**
- Consumes: `AgentMessageBlock[]` from `display/agent-message-blocks.ts`.
- Produces: `buildAgentMessageNavigationItems(blocks, emptyPreview) -> AgentMessageNavigationItem[]`.
- Produces: `getActiveAgentMessageNavigationId(items, visibleStartIndex) -> string | null`.
- Produces: `AgentMessageNavigator({ items, activeId, onNavigate })`.

- [ ] **Step 1: Define navigation data and preview normalization**

Create the internal type and functions below. Keep preview generation defensive: normalize mention markup, Markdown punctuation, HTML tags, and whitespace without rendering user-controlled HTML.

```typescript
import type { AgentMessageBlock } from "./display/agent-message-blocks";

export interface AgentMessageNavigationItem {
  id: string;
  blockIndex: number;
  preview: string;
  timestamp?: number;
}

const PREVIEW_LENGTH = 100;

function createPreview(content: string | undefined, emptyPreview: string): string {
  const text = (content ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_>#~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return emptyPreview;
  return text.length > PREVIEW_LENGTH ? `${text.slice(0, PREVIEW_LENGTH)}…` : text;
}

export function buildAgentMessageNavigationItems(
  blocks: AgentMessageBlock[],
  emptyPreview: string,
): AgentMessageNavigationItem[] {
  return blocks.flatMap((block, blockIndex) => {
    if (block.type !== "user") return [];
    const message = block.messages[0];
    if (!message || message.type !== "user_request") return [];
    return [{
      id: block.id,
      blockIndex,
      preview: createPreview(message.content, emptyPreview),
      timestamp: Number.isFinite(message.timestamp) ? message.timestamp : undefined,
    }];
  });
}

export function getActiveAgentMessageNavigationId(
  items: AgentMessageNavigationItem[],
  visibleStartIndex: number,
): string | null {
  if (items.length === 0) return null;
  let active = items[0];
  for (const item of items) {
    if (item.blockIndex > visibleStartIndex) break;
    active = item;
  }
  return active.id;
}
```

- [ ] **Step 2: Create the focused rail component**

Use real buttons and Radix `Tooltip`. The parent supplies stable items and performs navigation; the component owns no conversation state.

```typescript
import { Flex, Text, Tooltip } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import type { AgentMessageNavigationItem } from "./agent-message-navigation";

interface AgentMessageNavigatorProps {
  items: AgentMessageNavigationItem[];
  activeId: string | null;
  onNavigate: (item: AgentMessageNavigationItem) => void;
}

export function AgentMessageNavigator({ items, activeId, onNavigate }: AgentMessageNavigatorProps) {
  const { t, i18n } = useTranslation();
  if (items.length < 2) return null;
  return (
    <nav className="agent-message-navigator" aria-label={t("assistant.messageNavigatorLabel")}>
      {items.map((item, index) => {
        const timestamp = item.timestamp === undefined
          ? null
          : new Intl.DateTimeFormat(i18n.language, {
              dateStyle: "short",
              timeStyle: "short",
            }).format(new Date(item.timestamp));
        return (
          <Tooltip
            key={item.id}
            content={
              <Flex direction="column" gap="1" className="agent-message-navigator-preview">
                {timestamp ? <Text size="1" color="gray">{timestamp}</Text> : null}
                <Text size="2">{item.preview}</Text>
              </Flex>
            }
          >
            <button
              type="button"
              className="agent-message-navigator-marker"
              data-active={item.id === activeId ? "true" : undefined}
              aria-label={t("assistant.messageNavigatorItem", { index: index + 1, preview: item.preview })}
              onClick={() => onNavigate(item)}
            />
          </Tooltip>
        );
      })}
    </nav>
  );
}
```

Format a valid timestamp with `Intl.DateTimeFormat(i18n.language, { dateStyle: "short", timeStyle: "short" })`; omit the time row when the timestamp is absent.

- [ ] **Step 3: Add compact responsive styling**

Make `.agent-messages-root` positioned, reserve 22px on the left only when it contains the navigator, and absolutely position a full-height rail over that safe space. Use a flex column with `justify-content: space-evenly`, `min-height: 0`, and no overflow so large histories compress into the available height. Markers are 8px wide normally and 18px when active/hovered. Use Radix gray/accent tokens and a visible `:focus-visible` outline.

At `@media (max-width: 767px)`, set `.agent-message-navigator { display: none; }` and remove the reserved left padding.

```css
.agent-messages-root {
  position: relative;
}

.agent-messages-root[data-has-navigator="true"] {
  padding-inline-start: 22px;
}

.agent-message-navigator {
  position: absolute;
  inset-block: 8px;
  inset-inline-start: 0;
  z-index: 2;
  display: flex;
  width: 20px;
  min-height: 0;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: flex-start;
  overflow: hidden;
}

.agent-message-navigator-marker {
  width: 8px;
  height: 2px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: var(--gray-a7);
  transition: width 120ms ease, background-color 120ms ease;
}

.agent-message-navigator-marker:hover,
.agent-message-navigator-marker:focus-visible,
.agent-message-navigator-marker[data-active="true"] {
  width: 18px;
  background: var(--accent-a10);
}

.agent-message-navigator-marker:focus-visible {
  outline: 2px solid var(--focus-8);
  outline-offset: 2px;
}

@media (max-width: 767px) {
  .agent-message-navigator { display: none; }
  .agent-messages-root[data-has-navigator="true"] { padding-inline-start: 0; }
}
```

- [ ] **Step 4: Add localized strings**

Add these meanings under `assistant` while following each locale's existing key order:

```json
{
  "messageNavigatorLabel": "历史用户消息导航",
  "messageNavigatorItem": "第 {{index}} 条用户消息：{{preview}}",
  "messageNavigatorEmptyPreview": "用户消息"
}
```

English values: `User message history`, `User message {{index}}: {{preview}}`, and `User message`.

- [ ] **Step 5: Run a local static checkpoint**

Run: `Set-Location frontend; pnpm type-check`

Expected: PASS after imports and tooltip props match the project's installed Radix version.

- [ ] **Step 6: Commit**

```powershell
git add frontend/src/features/assistant/components/agent/agent-message-navigation.ts frontend/src/features/assistant/components/agent/agent-message-navigator.tsx frontend/src/features/assistant/components/agent/agent-message-blocks.css frontend/src/i18n/locales/zh-CN.json frontend/src/i18n/locales/en.json
git commit -m "feat(assistant): add user message navigator rail"
```

---

### Task 2: Connect the rail to Virtuoso scrolling

**Files:**
- Modify: `frontend/src/features/assistant/components/agent/agent-messages.tsx`

**Interfaces:**
- Consumes: the Task 1 navigation helpers and `AgentMessageNavigator`.
- Consumes: `VirtuosoHandle` and `ListRange` from `react-virtuoso`.
- Produces: correct active-marker updates and index navigation for virtualized blocks.

- [ ] **Step 1: Add Virtuoso state and derive navigation items**

Import `type VirtuosoHandle, type ListRange`, create `virtuosoRef`, and track `visibleStartIndex`. Reset the visible start to zero when the session's `scrollToBottomKey` changes.

```typescript
const virtuosoRef = useRef<VirtuosoHandle>(null);
const [visibleStartIndex, setVisibleStartIndex] = useState(0);
const navigationItems = useMemo(
  () => buildAgentMessageNavigationItems(
    visibleMessageBlocks,
    t("assistant.messageNavigatorEmptyPreview"),
  ),
  [t, visibleMessageBlocks],
);
const activeNavigationId = useMemo(
  () => getActiveAgentMessageNavigationId(navigationItems, visibleStartIndex),
  [navigationItems, visibleStartIndex],
);
```

- [ ] **Step 2: Track the visible range**

Attach the handle and range callback without altering the existing custom scroll parent, height estimates, viewport padding, footer, or item keys.

```tsx
<Virtuoso
  ref={virtuosoRef}
  rangeChanged={(range: ListRange) => setVisibleStartIndex(range.startIndex)}
  customScrollParent={scrollParent}
  data={visibleMessageBlocks}
  computeItemKey={(_index, block) => block.id}
  itemContent={(_index, block) => renderBlock(block)}
  heightEstimates={heightEstimates}
  increaseViewportBy={{ top: 600, bottom: 600 }}
  context={footerContext}
  components={{ Footer: AgentMessagesFooter }}
/>
```

- [ ] **Step 3: Implement safe historical navigation**

Resolve the target ID against the latest `navigationItems` before scrolling. Disable follow-bottom first, cancel any pending automatic bottom restoration/streaming animation frame, then scroll with reduced-motion awareness.

```typescript
const handleNavigateToUserMessage = useCallback((requested: AgentMessageNavigationItem) => {
  const current = navigationItems.find((item) => item.id === requested.id);
  if (!current || !virtuosoRef.current) return;
  shouldFollowBottomRef.current = false;
  isRestoringLoadedSessionBottomRef.current = false;
  if (restoreScrollRafRef.current !== null) window.cancelAnimationFrame(restoreScrollRafRef.current);
  if (streamingScrollRafRef.current !== null) window.cancelAnimationFrame(streamingScrollRafRef.current);
  virtuosoRef.current.scrollToIndex({
    index: current.blockIndex,
    align: "start",
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
  });
}, [navigationItems]);
```

Set cancelled RAF refs to `null` so later streaming/bottom-follow scheduling remains correct.

- [ ] **Step 4: Render the navigator beside message content**

Render `AgentMessageNavigator` as a direct child of `.agent-messages-root` before `.agent-message-scroll-content`. Add `data-has-navigator="true"` only when `navigationItems.length >= 2`, allowing CSS to reserve space without measuring the component.

- [ ] **Step 5: Run the reduced verification commands**

Run:

```powershell
Set-Location frontend
pnpm type-check
pnpm lint
pnpm build
```

Expected: every command exits 0. Do not add or run a new unit or E2E test for this feature.

- [ ] **Step 6: Perform one manual walkthrough**

Open one desktop conversation containing several user turns. In the same walkthrough verify marker count/order, hover time and preview, click-to-jump for an offscreen request, active marker changes while scrolling through Agent replies, historical navigation during streaming does not snap back to bottom, returning to the bottom restores normal following, and a viewport at or below 767px hides the rail. Switch or roll back the task once and confirm stale markers disappear.

- [ ] **Step 7: Commit**

```powershell
git add frontend/src/features/assistant/components/agent/agent-messages.tsx
git commit -m "feat(assistant): navigate virtualized user messages"
```

---

## Final Review Checklist

- [ ] `git diff --check` reports no whitespace errors.
- [ ] No test file, dependency, backend file, editor file, or settings file changed.
- [ ] Only user blocks produce navigation items and their indices refer to `visibleMessageBlocks`.
- [ ] Fewer than two user items and viewports at or below 767px show no rail or reserved gap.
- [ ] Historical navigation disables pending bottom-follow work before calling `scrollToIndex`.
- [ ] Existing message virtualization, footer, rollback, fork, tool display, and scroll-to-bottom behavior remain intact.
- [ ] `git status --short` contains only intended work plus the pre-existing untracked `docs/develop/feature-map.md`.
