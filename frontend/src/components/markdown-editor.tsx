import { Tooltip } from "@radix-ui/themes";
import type { EditorView } from "@tiptap/pm/view";
import { useEditor } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ContextMenu } from "./context-menu";
import { DocumentEditor } from "./document-editor";
import { type EditorToolbarExtraAction } from "./editor-toolbar";
import { ExternalLinkSafetyDialog } from "./external-link-safety-dialog";
import { createMarkdownEditorExtensions } from "./markdown-editor-config";
import { useEditorSearch } from "./use-editor-search";

export interface MarkdownEditorProps {
  title: string;
  onTitleChange: (title: string) => void;
  content: string;
  onContentChange: (markdown: string) => void;
  onSave: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
  isLocked?: boolean;
  onLockedAction?: () => void;
  placeholder?: string;
  titlePlaceholder?: string;
  extraToolbarActions?: EditorToolbarExtraAction[];
  toolbarPrefix?: React.ReactNode;
  wordCount?: number;
  saveStatusText?: { saving: string; saved: string; unsaved: string };
  wordCountLabel?: string;
  lockedBanner?: React.ReactNode;
  maxWidth?: number;
  editorRef?: React.MutableRefObject<Editor | null>;
  scrollTop?: number;
  onScrollPositionChange?: (scrollTop: number) => void;
}

interface HoveredEditorLink {
  href: string;
  top: number;
  left: number;
  width: number;
  height: number;
}

function EditorLinkTooltip({ link }: { link: HoveredEditorLink | null }) {
  if (!link) return null;

  return (
    <Tooltip
      content={link.href}
      open
    >
      <span
        aria-hidden="true"
        className="editor-link-tooltip-anchor"
        style={{
          top: link.top,
          left: link.left,
          width: link.width,
          height: link.height,
        }}
      />
    </Tooltip>
  );
}

export function MarkdownEditor({
  title,
  onTitleChange,
  content,
  onContentChange,
  onSave,
  isSaving = false,
  hasChanges = false,
  isLocked = false,
  onLockedAction,
  placeholder,
  titlePlaceholder,
  extraToolbarActions,
  toolbarPrefix,
  wordCount: externalWordCount,
  saveStatusText,
  wordCountLabel,
  lockedBanner,
  maxWidth = 800,
  editorRef: externalEditorRef,
  scrollTop = 0,
  onScrollPositionChange,
}: MarkdownEditorProps) {
  const search = useEditorSearch(isLocked, onLockedAction);
  const saveActionRef = useRef({ isLocked, onLockedAction, onSave });
  saveActionRef.current = { isLocked, onLockedAction, onSave };
  const contentSyncedRef = useRef(content);
  const editorContentRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const initialScrollTopRef = useRef(scrollTop);
  const latestScrollTopRef = useRef(scrollTop);
  const scrollPositionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pendingExternalLink, setPendingExternalLink] = useState<string | null>(null);
  const [hoveredEditorLink, setHoveredEditorLink] = useState<HoveredEditorLink | null>(null);

  const handleEditorLinkClick = useCallback(
    (_view: EditorView, _pos: number, event: MouseEvent) => {
      const target = event.target;
      const link = target instanceof Element ? target.closest("a[href]") : null;
      const href = link?.getAttribute("href");
      if (!href) return false;

      event.preventDefault();
      setHoveredEditorLink(null);
      setPendingExternalLink(href);
      return true;
    },
    [],
  );

  const handleEditorLinkMouseOver = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target;
    const link = target instanceof Element ? target.closest("a[href]") : null;
    if (!link || !editorContentRef.current?.contains(link)) return;

    const relatedTarget = event.relatedTarget;
    if (relatedTarget instanceof Node && link.contains(relatedTarget)) return;

    const rect = link.getBoundingClientRect();
    const href = link.getAttribute("href");
    if (!href) return;

    setHoveredEditorLink({
      href,
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }, []);

  const handleEditorLinkMouseOut = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target;
    const link = target instanceof Element ? target.closest("a[href]") : null;
    if (!link || !editorContentRef.current?.contains(link)) return;

    const relatedTarget = event.relatedTarget;
    if (relatedTarget instanceof Node && link.contains(relatedTarget)) return;
    setHoveredEditorLink(null);
  }, []);

  const handleConfirmExternalLink = useCallback(() => {
    if (!pendingExternalLink) return;
    window.open(pendingExternalLink, "_blank", "noopener,noreferrer");
  }, [pendingExternalLink]);

  const editor = useEditor({
    extensions: createMarkdownEditorExtensions({
      placeholder: placeholder ?? "",
      shortcuts: {
        onFind: search.openFind,
        onReplace: search.openReplace,
        onSave: () => {
          const action = saveActionRef.current;
          if (action.isLocked) {
            action.onLockedAction?.();
            return;
          }
          action.onSave();
        },
      },
    }),
    content,
    contentType: "markdown",
    editable: !isLocked,
    editorProps: {
      handleClick: handleEditorLinkClick,
    },
  });
  const editorRef = useRef(editor);

  useEffect(() => {
    editorRef.current = editor;
    if (externalEditorRef) {
      externalEditorRef.current = editor;
    }
  }, [editor, externalEditorRef]);

  useEffect(() => {
    if (!editor) return;
    const onUpdate = () => {
      const markdown = editorRef.current?.getMarkdown();
      if (markdown !== undefined && markdown !== contentSyncedRef.current) {
        contentSyncedRef.current = markdown;
        onContentChange(markdown);
      }
    };
    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
    };
  }, [editor, onContentChange]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!isLocked);
  }, [editor, isLocked]);

  useEffect(() => {
    const currentEditor = editorRef.current;
    if (!currentEditor) return;
    if (content === contentSyncedRef.current) return;

    const { from, to } = currentEditor.state.selection;
    const wasFocused = currentEditor.isFocused;
    contentSyncedRef.current = content;
    currentEditor.commands.setContent(content, { contentType: "markdown", emitUpdate: false });
    if (!wasFocused) return;

    const maxPosition = Math.max(1, currentEditor.state.doc.content.size);
    currentEditor.commands.setTextSelection({
      from: Math.min(from, maxPosition),
      to: Math.min(to, maxPosition),
    });
  }, [content]);

  const flushScrollPosition = useCallback(() => {
    if (scrollPositionTimerRef.current) {
      clearTimeout(scrollPositionTimerRef.current);
      scrollPositionTimerRef.current = null;
    }
    const scrollPosition = scrollContainerRef.current?.scrollTop ?? latestScrollTopRef.current;
    latestScrollTopRef.current = scrollPosition;
    onScrollPositionChange?.(scrollPosition);
  }, [onScrollPositionChange]);

  const handleEditorScroll = useCallback(() => {
    if (!onScrollPositionChange) return;

    const scrollPosition = scrollContainerRef.current?.scrollTop;
    if (scrollPosition === undefined) return;

    latestScrollTopRef.current = scrollPosition;
    if (scrollPositionTimerRef.current) return;

    scrollPositionTimerRef.current = setTimeout(() => {
      scrollPositionTimerRef.current = null;
      onScrollPositionChange?.(latestScrollTopRef.current);
    }, 250);
  }, [onScrollPositionChange]);

  useEffect(() => {
    if (!onScrollPositionChange) return;

    return flushScrollPosition;
  }, [flushScrollPosition, onScrollPositionChange]);

  useEffect(() => {
    if (!editor || !onScrollPositionChange) return;

    let restoreFrameId: number | null = null;
    const frameId = window.requestAnimationFrame(() => {
      restoreFrameId = window.requestAnimationFrame(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const maxScrollTop = Math.max(0, container.scrollHeight - container.clientHeight);
        const restoredScrollTop = Math.min(initialScrollTopRef.current, maxScrollTop);
        container.scrollTop = restoredScrollTop;
        latestScrollTopRef.current = restoredScrollTop;
        if (restoredScrollTop !== initialScrollTopRef.current) {
          onScrollPositionChange?.(restoredScrollTop);
        }
      });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      if (restoreFrameId !== null) window.cancelAnimationFrame(restoreFrameId);
    };
  }, [editor, onScrollPositionChange]);

  const handleTitleBlur = useCallback(() => {
    if (hasChanges && !isLocked) {
      onSave();
    }
  }, [hasChanges, isLocked, onSave]);

  const wordCount = externalWordCount ?? editor?.storage.characterCount?.characters() ?? 0;

  return (
    <DocumentEditor
      toolbar={{
        editor,
        onSave,
        isSaving,
        hasChanges,
        isAgentLocked: isLocked,
        onLockedAction,
        extraActions: extraToolbarActions,
        toolbarPrefix,
        showMarkdownTools: true,
      }}
      search={search}
      title={{
        value: title,
        onChange: onTitleChange,
        onBlur: handleTitleBlur,
        disabled: isLocked,
        onDisabledClick: onLockedAction,
        placeholder: titlePlaceholder,
      }}
      scrollProps={{ ref: scrollContainerRef, onScroll: handleEditorScroll }}
      contentProps={{ className: "markdown-editor-content", style: { maxWidth, margin: "0 auto" } }}
      bodyProps={{
        ref: editorContentRef,
        onMouseOver: handleEditorLinkMouseOver,
        onMouseOut: handleEditorLinkMouseOut,
      }}
      wordCount={wordCount}
      wordCountLabel={wordCountLabel}
      saveStatusText={saveStatusText}
      banner={lockedBanner}
    >
      {!isLocked && (
        <ContextMenu
          editor={editor}
          containerRef={editorContentRef}
        />
      )}
      <ExternalLinkSafetyDialog
        isOpen={pendingExternalLink !== null}
        url={pendingExternalLink ?? ""}
        onClose={() => setPendingExternalLink(null)}
        onConfirm={handleConfirmExternalLink}
      />
      <EditorLinkTooltip link={hoveredEditorLink} />
    </DocumentEditor>
  );
}
