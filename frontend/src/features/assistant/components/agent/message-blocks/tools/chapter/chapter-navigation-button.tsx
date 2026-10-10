import { IconButton, Tooltip } from "@radix-ui/themes";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

import { useChapterNavigation } from "@/features/assistant/hooks/use-chapter-navigation";
import type { ChapterLineTarget } from "@/features/writing/lib/chapter-navigation";
import i18n from "@/i18n";

export function ChapterNavigationButton({
  chapterId,
  target,
  children,
  className,
}: {
  chapterId: string;
  target?: ChapterLineTarget;
  children?: ReactNode;
  className?: string;
}) {
  const navigateToChapter = useChapterNavigation();
  const label = i18n.t("assistant.chapterNavigation.open");
  const onClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    void navigateToChapter(chapterId, target);
  };
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") event.stopPropagation();
  };
  return (
    <Tooltip content={label}>
      {children ? (
        <button
          type="button"
          className={`agent-chapter-navigation-link ${className ?? ""}`}
          onClick={onClick}
          onKeyDown={onKeyDown}
          aria-label={`${label}: ${typeof children === "string" ? children : ""}`}
        >
          {children}
        </button>
      ) : (
        <IconButton
          size="1"
          variant="ghost"
          color="gray"
          aria-label={label}
          onClick={onClick}
          onKeyDown={onKeyDown}
        >
          <ArrowUpRight size={14} />
        </IconButton>
      )}
    </Tooltip>
  );
}
