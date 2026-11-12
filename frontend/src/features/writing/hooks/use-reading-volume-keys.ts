import { useEffect } from "react";

type PageDirection = "previous" | "next";
type ReadingHost = Window & { OpenFicReading?: { postMessage: (message: string) => void } };

/** The Android host owns physical keys; browsers without this bridge keep system volume. */
export function useReadingVolumeKeys(enabled: boolean, onPage: (direction: PageDirection) => void) {
  useEffect(() => {
    const native = (window as ReadingHost).OpenFicReading;
    if (!native) return;
    let focused = document.hasFocus();
    const canCapture = () => enabled && focused && document.visibilityState === "visible";
    const publish = (active: boolean) => {
      try {
        native.postMessage(JSON.stringify({ enabled: active }));
      } catch {
        // A closing/reloading WebView may already have disconnected the host.
      }
    };
    const sync = () => publish(canCapture());
    const blur = () => {
      focused = false;
      sync();
    };
    const focus = () => {
      focused = true;
      sync();
    };
    const resume = () => {
      focused = document.hasFocus();
      sync();
    };
    const page = (event: Event) => {
      if (!canCapture() || !(event instanceof CustomEvent)) return;
      const direction: unknown = event.detail?.direction;
      if (direction === "previous" || direction === "next") onPage(direction);
    };

    window.addEventListener("openfic:reading-volume-key", page);
    window.addEventListener("openfic:reading-native-resume", resume);
    window.addEventListener("blur", blur);
    window.addEventListener("focus", focus);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      window.removeEventListener("openfic:reading-volume-key", page);
      window.removeEventListener("openfic:reading-native-resume", resume);
      window.removeEventListener("blur", blur);
      window.removeEventListener("focus", focus);
      document.removeEventListener("visibilitychange", sync);
      publish(false);
    };
  }, [enabled, onPage]);
}
