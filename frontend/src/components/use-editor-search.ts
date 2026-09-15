import { useCallback, useRef, useState } from "react";

export function useEditorSearch(isLocked: boolean, onLockedAction?: () => void) {
  const [mode, setMode] = useState<"closed" | "find" | "replace">("closed");
  const lockRef = useRef({ isLocked, onLockedAction });
  lockRef.current = { isLocked, onLockedAction };
  const openFind = useCallback(() => {
    if (lockRef.current.isLocked) return lockRef.current.onLockedAction?.();
    setMode("find");
  }, []);
  const openReplace = useCallback(() => {
    if (lockRef.current.isLocked) return lockRef.current.onLockedAction?.();
    setMode("replace");
  }, []);
  const close = useCallback(() => setMode("closed"), []);
  return { mode, openFind, openReplace, close };
}
