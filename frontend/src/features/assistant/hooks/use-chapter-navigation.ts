import { useContext } from "react";
import { useNavigate, useParams } from "react-router";

import { toast } from "@/components";
import { AppShellContext } from "@/features/app-shell/components/app-shell-context";
import type { ChapterLineTarget } from "@/features/writing/lib/chapter-navigation";
import { useChapterNavigationStore } from "@/features/writing/store/use-chapter-navigation-store";
import { useTabsStore } from "@/features/writing/store/use-tabs-store";
import i18n from "@/i18n";
import { fetchChapter } from "@/lib/api-client";

export function useChapterNavigation() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const shell = useContext(AppShellContext);

  return async (chapterId: string, target: ChapterLineTarget = { line: 1 }) => {
    const sourceProjectId = projectId ?? useTabsStore.getState().currentProjectId;
    if (!sourceProjectId) return;
    const store = useChapterNavigationStore.getState();
    const id = store.begin();
    try {
      const chapter = await fetchChapter(chapterId);
      if (useChapterNavigationStore.getState().sequence !== id) return;
      if (
        chapter.projectId !== sourceProjectId ||
        useTabsStore.getState().currentProjectId !== sourceProjectId
      )
        return;
      store.publish({ ...target, id, chapterId, projectId: sourceProjectId, title: chapter.title });
      navigate(`/projects/${encodeURIComponent(sourceProjectId)}`);
      if (shell?.isMobile) shell.closeAssistantSidebar();
    } catch {
      if (useChapterNavigationStore.getState().sequence === id) {
        toast.error(i18n.t("assistant.chapterNavigation.unavailable"));
      }
    }
  };
}
