import { Button, Dialog } from "@radix-ui/themes";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Pause, Play, Settings2, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { fetchChapter } from "@/lib/api-client";
import type { Chapter, ChapterListItem } from "@/lib/chapter.types";
import { getPreference, getWritingWorkingCopy, setPreference } from "@/lib/local-db";

import { useReadingVolumeKeys } from "../hooks/use-reading-volume-keys";
import {
  DEFAULT_READING_PREFERENCES,
  getReadingLayout,
  getReadingPageTarget,
  normalizeReadingPreferences,
  resolveReadingShortcut,
} from "../lib/reading-mode";
import { resolveWritingWorkingCopy } from "../lib/writing-working-copy";
import { ReadingSettings } from "./reading-settings";

import "./reading-mode.css";

const PREFERENCES_KEY = "writing.reading.preferences";

interface ReadingModeProps {
  projectId: string;
  initialChapter: Chapter;
  chapters: ChapterListItem[];
  onClose: () => void;
}

/** A separate view of the draft: the editing surface stays mounted underneath. */
export function ReadingMode({ projectId, initialChapter, chapters, onClose }: ReadingModeProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [returnFocusTarget] = useState(() =>
    document.activeElement instanceof HTMLElement ? document.activeElement : null,
  );
  const [chapter, setChapter] = useState(initialChapter);
  const [preferences, setPreferences] = useState(DEFAULT_READING_PREFERENCES);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [layout, setLayout] = useState(() => getReadingLayout(0, 0, 0));
  const [measuredChapterId, setMeasuredChapterId] = useState<string | null>(null);
  const [viewportElement, setViewportElement] = useState<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const entryRef = useRef<"first" | "last">("first");
  const requestRef = useRef(0);
  const chapterIndex = chapters.findIndex((item) => item.id === chapter.id);
  const layoutReady = measuredChapterId === chapter.id && viewportElement !== null;
  const atStart = chapterIndex <= 0 && layout.pageIndex === 0;
  const atEnd =
    layoutReady &&
    (chapterIndex < 0 || chapterIndex >= chapters.length - 1) &&
    layout.pageIndex === layout.pageCount - 1;
  const attachViewport = useCallback((element: HTMLDivElement | null) => {
    viewportRef.current = element;
    setViewportElement(element);
  }, []);

  useEffect(() => {
    let active = true;
    void getPreference(PREFERENCES_KEY).then((stored) => {
      if (!active) return;
      let value: unknown = null;
      try {
        value = stored ? JSON.parse(stored) : null;
      } catch {
        // A malformed local preference must not prevent reading.
      }
      setPreferences(normalizeReadingPreferences(value));
      setPreferencesReady(true);
    });
    return () => {
      active = false;
      requestRef.current += 1;
    };
  }, []);

  useEffect(() => {
    if (preferencesReady) void setPreference(PREFERENCES_KEY, JSON.stringify(preferences));
  }, [preferences, preferencesReady]);

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    setMeasuredChapterId(chapter.id);
    const next = getReadingLayout(viewport.clientHeight, viewport.scrollHeight, viewport.scrollTop);
    setLayout((current) =>
      current.step === next.step &&
      current.maxScrollTop === next.maxScrollTop &&
      current.pageIndex === next.pageIndex &&
      current.pageCount === next.pageCount
        ? current
        : next,
    );
  }, [chapter.id]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTop = entryRef.current === "last" ? viewport.scrollHeight : 0;
    measure();
  }, [chapter.id, chapter.content, measure, viewportElement]);

  useEffect(() => {
    if (!viewportElement) return;
    const observer = new ResizeObserver(measure);
    observer.observe(viewportElement);
    if (contentRef.current) observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [measure, viewportElement]);

  useEffect(() => {
    const pause = () => setPlaying(false);
    const onVisibility = () => {
      if (document.visibilityState !== "visible") pause();
    };
    window.addEventListener("blur", pause);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", pause);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const changeChapter = useCallback(
    async (id: string, entry: "first" | "last") => {
      const request = ++requestRef.current;
      setLoading(true);
      setLoadError(false);
      try {
        const next =
          id === initialChapter.id
            ? initialChapter
            : await queryClient.fetchQuery({
                queryKey: ["reading-chapter", projectId, id],
                queryFn: async () => {
                  const [remote, workingCopy] = await Promise.all([
                    fetchChapter(id),
                    getWritingWorkingCopy("chapter", id),
                  ]);
                  if (remote.projectId !== projectId || remote.id !== id)
                    throw new Error("Unexpected chapter");
                  return { ...remote, ...resolveWritingWorkingCopy(remote, workingCopy).draft };
                },
                staleTime: 0,
                retry: false,
              });
        if (request !== requestRef.current) return;
        entryRef.current = entry;
        setChapter(next);
      } catch {
        if (request !== requestRef.current) return;
        setLoadError(true);
        setPlaying(false);
      } finally {
        if (request === requestRef.current) setLoading(false);
      }
    },
    [initialChapter, projectId, queryClient],
  );

  const turnPage = useCallback(
    (direction: "previous" | "next") => {
      const viewport = viewportRef.current;
      if (!viewport || !layoutReady || loading || settingsOpen) return;
      const current = getReadingLayout(
        viewport.clientHeight,
        viewport.scrollHeight,
        viewport.scrollTop,
      );
      const target = getReadingPageTarget(direction, current);
      if (target.chapterDelta) {
        const next = chapterIndex < 0 ? undefined : chapters[chapterIndex + target.chapterDelta];
        if (!next) {
          setPlaying(false);
          return;
        }
        void changeChapter(next.id, direction === "next" ? "first" : "last");
      } else {
        viewport.scrollTop = target.scrollTop;
        measure();
      }
    },
    [changeChapter, chapterIndex, chapters, layoutReady, loading, measure, settingsOpen],
  );

  useEffect(() => {
    if (atEnd) setPlaying(false);
  }, [atEnd]);

  const handleVolumePage = useCallback(
    (direction: "previous" | "next") => {
      setPlaying(false);
      turnPage(direction);
    },
    [turnPage],
  );
  useReadingVolumeKeys(layoutReady && !loading && !settingsOpen, handleVolumePage);

  useEffect(() => {
    if (
      !playing ||
      loading ||
      settingsOpen ||
      atEnd ||
      !layoutReady ||
      !preferencesReady ||
      document.visibilityState !== "visible"
    )
      return;
    const timer = window.setTimeout(() => turnPage("next"), preferences.autoTurnSeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [
    playing,
    loading,
    settingsOpen,
    atEnd,
    layoutReady,
    preferencesReady,
    preferences.autoTurnSeconds,
    chapter.id,
    layout.pageIndex,
    turnPage,
  ]);

  const focusReading = () => viewportRef.current?.focus({ preventScroll: true });
  const closeSettings = () => {
    setSettingsOpen(false);
    window.requestAnimationFrame(focusReading);
  };

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Content
        className="reading-mode"
        aria-describedby={undefined}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (returnFocusTarget?.isConnected) returnFocusTarget.focus({ preventScroll: true });
        }}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          focusReading();
        }}
        onEscapeKeyDown={(event) => {
          if (!settingsOpen) return;
          event.preventDefault();
          if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
          closeSettings();
        }}
        onKeyDownCapture={(event) => {
          // Keep the mounted editor's global shortcuts out of the reading dialog.
          if (
            (event.ctrlKey || event.metaKey) &&
            ["s", "f", "h"].includes(event.key.toLowerCase())
          ) {
            event.stopPropagation();
            return;
          }
          if (
            settingsOpen ||
            (event.target instanceof Element &&
              event.target.closest(
                "input, textarea, select, button, [contenteditable=true], [role=combobox]",
              ))
          )
            return;
          const direction = resolveReadingShortcut(event.nativeEvent, preferences);
          if (!direction) return;
          event.preventDefault();
          event.stopPropagation();
          setPlaying(false);
          turnPage(direction);
        }}
      >
        <header className="reading-mode-header">
          <div className="reading-mode-heading">
            <span className="reading-mode-caption">{t("reading.title")}</span>
            <Dialog.Title className="reading-mode-title">
              {chapter.title || t("writing.untitledChapter")}
            </Dialog.Title>
          </div>
          <Button
            variant="soft"
            color="gray"
            disabled={!preferencesReady}
            onClick={() => {
              setPlaying(false);
              setSettingsOpen((open) => !open);
            }}
            aria-label={t("reading.settings")}
            aria-expanded={settingsOpen}
          >
            <Settings2 size={16} />
            <span className="reading-mode-button-label">{t("reading.settings")}</span>
          </Button>
          <Dialog.Close>
            <Button
              variant="ghost"
              color="gray"
              aria-label={t("reading.exit")}
            >
              <X size={20} />
            </Button>
          </Dialog.Close>
        </header>
        {settingsOpen && (
          <ReadingSettings
            preferences={preferences}
            onChange={setPreferences}
            onClose={closeSettings}
          />
        )}
        {loadError && (
          <div
            role="alert"
            className="reading-mode-error"
          >
            {t("reading.loadFailed")}
          </div>
        )}
        <div
          className="reading-mode-body"
          aria-busy={loading}
        >
          <div
            ref={attachViewport}
            className="reading-mode-viewport"
            data-testid="reading-viewport"
            tabIndex={0}
            role="region"
            aria-label={t("reading.content")}
            onScroll={measure}
          >
            <div
              ref={contentRef}
              className="reading-mode-content"
              data-testid="reading-content"
            >
              {chapter.content || <span className="reading-mode-empty">{t("reading.empty")}</span>}
            </div>
          </div>
          {loading && (
            <div
              className="reading-mode-loading"
              role="status"
            >
              {t("reading.loading")}
            </div>
          )}
        </div>
        <footer className="reading-mode-footer">
          <div className="reading-mode-page-controls">
            <Button
              variant="soft"
              color="gray"
              disabled={loading || settingsOpen || !layoutReady || atStart}
              aria-label={t("reading.previous")}
              onClick={() => {
                setPlaying(false);
                turnPage("previous");
                focusReading();
              }}
            >
              <ChevronLeft size={18} />
              <span>{t("reading.previous")}</span>
            </Button>
            <span
              data-testid="reading-progress"
              className="reading-mode-progress"
              aria-live="polite"
            >
              {t("reading.progress", {
                page: layout.pageIndex + 1,
                pages: layout.pageCount,
                chapter: Math.max(1, chapterIndex + 1),
                chapters: Math.max(1, chapters.length),
              })}
            </span>
            <Button
              variant="soft"
              color="gray"
              disabled={loading || settingsOpen || !layoutReady || atEnd}
              aria-label={t("reading.next")}
              onClick={() => {
                setPlaying(false);
                turnPage("next");
                focusReading();
              }}
            >
              <span>{t("reading.next")}</span>
              <ChevronRight size={18} />
            </Button>
          </div>
          <Button
            variant={playing ? "solid" : "soft"}
            disabled={loading || settingsOpen || atEnd || !layoutReady || !preferencesReady}
            aria-label={t(playing ? "reading.pause" : "reading.play")}
            aria-pressed={playing}
            onClick={() => {
              setPlaying((active) => !active);
              focusReading();
            }}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
            {t(playing ? "reading.pause" : "reading.play")}
          </Button>
        </footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}
