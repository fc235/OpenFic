/**
 * Entry Editor Component
 *
 * 世界书条目编辑器，基于项目 Markdown 编辑器，支持自动保存。
 * 注意：父组件应使用 key={entry.id} 来确保 entry 变化时组件重新挂载。
 */

import { useQueryClient } from "@tanstack/react-query";
import type { Editor } from "@tiptap/react";
import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { MarkdownEditor } from "@/components";
import { toast } from "@/components/toast";
import { useEditorDraft, type EditorDraft } from "@/hooks/use-editor-draft";
import { updateWorldInfoEntry } from "@/lib/api-client";
import {
  getEditorContentLimit,
  MAX_EDITOR_CONTENT_CHARACTERS,
  MAX_EDITOR_CONTENT_LINES,
} from "@/lib/editor-content-limits";
import { countTokensAsync } from "@/lib/token-count-async";
import type {
  WorldInfoEntry,
  WorldInfoEntryBrief,
  WorldInfoEntryBriefListResponse,
} from "@/lib/world-info.types";

interface EntryEditorProps {
  /** 条目数据 */
  entry: WorldInfoEntry;
  /** 世界书 ID（用于刷新缓存） */
  worldInfoId: string;
  /** 同一世界书中的条目列表，用于名称唯一性校验 */
  entries: WorldInfoEntryBrief[];
  /** 滚动到指定行（1-based） */
  scrollToLine?: number | null;
  /** 滚动完成后回调 */
  onScrollComplete?: () => void;
  /** Agent 运行时锁定编辑 */
  isAgentLocked?: boolean;
  canSave: () => boolean;
}

export function EntryEditor({
  entry,
  worldInfoId,
  entries,
  scrollToLine,
  onScrollComplete,
  isAgentLocked = false,
  canSave,
}: EntryEditorProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [tokenCount, setTokenCount] = useState<number>(entry.tokenCount || 0);
  const editorRef = useRef<Editor | null>(null);
  const scrolledRef = useRef(false);
  const rejectedContentRef = useRef<string | null>(null);

  const showContentLimitToast = useCallback(
    (content: string) => {
      if (rejectedContentRef.current === content) return;
      rejectedContentRef.current = content;
      const { lineCount, characterCount } = getEditorContentLimit(content);
      toast.error(
        t("common.editorContentTooLarge", {
          lineCount,
          characterCount,
          maxLines: MAX_EDITOR_CONTENT_LINES,
          maxCharacters: MAX_EDITOR_CONTENT_CHARACTERS,
        }),
      );
    },
    [t],
  );

  const updateCaches = useCallback(
    async (updated: WorldInfoEntry) => {
      await queryClient.cancelQueries(
        { queryKey: ["world-info-entry-detail", entry.id], exact: true },
        { revert: false },
      );
      queryClient.setQueryData(["world-info-entry-detail", entry.id], updated);
      queryClient.setQueryData(
        ["world-info-entries", worldInfoId],
        (old: WorldInfoEntryBriefListResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((item) =>
              item.id === updated.id
                ? {
                    ...item,
                    name: updated.name,
                    tokenCount: updated.tokenCount,
                  }
                : item,
            ),
          };
        },
      );
    },
    [entry.id, queryClient, worldInfoId],
  );

  const saveDraft = useCallback(
    async ({ title, content }: EditorDraft): Promise<EditorDraft | null> => {
      if (!getEditorContentLimit(content).isWithinLimit) {
        showContentLimitToast(content);
        return null;
      }
      rejectedContentRef.current = null;
      const newName = title.trim();
      if (entries.some((item) => item.id !== entry.id && item.name === newName)) {
        toast.error(t("worldInfo.duplicateEntryName"));
        return null;
      }
      const newTokenCount = await countTokensAsync(content);
      if (!canSave()) return null;
      const updated = await updateWorldInfoEntry(entry.id, {
        name: newName,
        content,
        tokenCount: newTokenCount,
      });
      await updateCaches(updated);
      return { title: updated.name, content: updated.content };
    },
    [canSave, entries, entry.id, showContentLimitToast, t, updateCaches],
  );
  const {
    title: name,
    content: draftContent,
    hasChanges,
    isSaving,
    isSaveBlocked,
    handleTitleChange,
    handleContentChange,
    handleSave,
  } = useEditorDraft({
    key: `world-info:${entry.id}`,
    value: { title: entry.name, content: entry.content },
    isLocked: isAgentLocked,
    canSave,
    onSave: saveDraft,
    onError: () => toast.error(t("common.saveFailed")),
  });

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      void countTokensAsync(draftContent).then((count) => {
        if (active) setTokenCount(count);
      });
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [draftContent]);

  useEffect(() => {
    if (scrollToLine == null || scrollToLine < 1 || scrolledRef.current) return;
    const editor = editorRef.current;
    if (!editor || editor.isDestroyed) return;

    const timer = setTimeout(() => {
      if (editor.isDestroyed) return;
      try {
        const totalLines = editor.state.doc.content.size;
        const lineHeight = 24;
        const targetPos = Math.min((scrollToLine - 1) * lineHeight, totalLines);
        const resolvedPos = editor.state.doc.resolve(targetPos);
        const node = editor.view.domAtPos(resolvedPos.pos);
        if (node.node) {
          const el =
            node.node.nodeType === Node.TEXT_NODE
              ? node.node.parentElement
              : (node.node as HTMLElement);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } finally {
        scrolledRef.current = true;
        onScrollComplete?.();
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [scrollToLine, onScrollComplete]);

  useEffect(() => {
    scrolledRef.current = false;
  }, [entry.id]);

  return (
    <MarkdownEditor
      title={name}
      onTitleChange={handleTitleChange}
      content={draftContent}
      onContentChange={handleContentChange}
      onSave={handleSave}
      isSaving={isSaving}
      isSaveBlocked={isSaveBlocked}
      hasChanges={hasChanges}
      placeholder={t("worldInfo.contentPlaceholder")}
      titlePlaceholder={t("worldInfo.entryNamePlaceholder")}
      wordCount={tokenCount}
      wordCountLabel={t("worldInfo.tokenCount")}
      editorRef={editorRef}
      isLocked={isAgentLocked}
    />
  );
}
