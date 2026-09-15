import { Box, Flex, Text } from "@radix-ui/themes";
import { EditorContent } from "@tiptap/react";
import { AnimatePresence } from "motion/react";
import type { ComponentProps, ReactNode } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useTranslation } from "react-i18next";

import { EditorToolbar, type EditorToolbarProps } from "./editor-toolbar";
import { FindReplacePanel } from "./find-replace-panel";
import { TitleInput, type TitleInputProps } from "./title-input";
import type { useEditorSearch } from "./use-editor-search";

interface DocumentEditorProps {
  toolbar: EditorToolbarProps;
  search: ReturnType<typeof useEditorSearch>;
  title: TitleInputProps;
  scrollProps?: ComponentProps<typeof Box>;
  contentProps?: ComponentProps<typeof Box>;
  bodyProps?: ComponentProps<typeof Box>;
  editorClassName?: string;
  wordCount: number;
  wordCountLabel?: string;
  saveStatusText?: { saving: string; saved: string; unsaved: string };
  banner?: ReactNode;
  children?: ReactNode;
}

/** Shared editing surface; entity adapters own serialization and persistence. */
export function DocumentEditor({
  toolbar,
  search,
  title,
  scrollProps,
  contentProps,
  bodyProps,
  editorClassName = "tiptap-editor",
  wordCount,
  wordCountLabel,
  saveStatusText,
  banner,
  children,
}: DocumentEditorProps) {
  const { t } = useTranslation();
  const { editor, isAgentLocked, onLockedAction, onSave } = toolbar;
  useHotkeys(
    "mod+s",
    (event) => {
      event.preventDefault();
      if (isAgentLocked) return onLockedAction?.();
      onSave(true);
    },
    { enableOnFormTags: true },
  );
  useHotkeys(
    "mod+f",
    (event) => {
      event.preventDefault();
      search.openFind();
    },
    { enableOnFormTags: true },
  );
  useHotkeys(
    "mod+h",
    (event) => {
      event.preventDefault();
      search.openReplace();
    },
    { enableOnFormTags: true },
  );
  const status = toolbar.isSaving ? "saving" : toolbar.hasChanges ? "unsaved" : "saved";

  return (
    <Box style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
      {banner}
      <EditorToolbar
        {...toolbar}
        onOpenFind={search.openFind}
        onOpenReplace={search.openReplace}
      />
      <AnimatePresence>
        {search.mode !== "closed" && editor && !isAgentLocked && (
          <FindReplacePanel
            key="find-replace-panel"
            editor={editor}
            showReplace={search.mode === "replace"}
            onClose={search.close}
          />
        )}
      </AnimatePresence>
      <Box
        className="tiptap-editor-wrapper"
        style={{ flex: 1, minHeight: 0, overflow: "auto" }}
        {...scrollProps}
      >
        <Box
          style={{ maxWidth: 800, margin: "0 auto" }}
          {...contentProps}
        >
          <TitleInput {...title} />
          <Box style={{ borderBottom: "1px solid var(--gray-a4)" }} />
          <Box
            py="5"
            {...bodyProps}
          >
            <EditorContent
              editor={editor}
              className={editorClassName}
            />
          </Box>
        </Box>
      </Box>
      {children}
      <Flex
        px="6"
        py="3"
        justify="between"
        align="center"
        style={{ borderTop: "1px solid var(--gray-a4)", background: "var(--gray-a2)" }}
      >
        <Text
          size="1"
          color="gray"
        >
          {wordCount} {wordCountLabel ?? t("writing.words")}
        </Text>
        <Text
          size="1"
          color="gray"
        >
          {saveStatusText?.[status] ??
            t(
              status === "saving"
                ? "writing.saving"
                : status === "saved"
                  ? "writing.saved"
                  : "writing.unsavedChanges",
            )}
        </Text>
      </Flex>
    </Box>
  );
}
