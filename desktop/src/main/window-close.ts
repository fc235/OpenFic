import type { CloseBehavior } from "../shared/desktop-preferences.js";

interface CloseChoice { behavior: Exclude<CloseBehavior, "ask"> | null; remember: boolean }
interface CloseDependencies {
  readBehavior: () => Promise<CloseBehavior>;
  choose: () => Promise<CloseChoice>;
  remember: (behavior: Exclude<CloseBehavior, "ask">) => Promise<unknown>;
  closeFrontend: () => void;
  quit: () => void;
  onError: (error: unknown) => void;
}

/** Serialize repeated X clicks while a choice or preference save is outstanding. */
export function createWindowCloseHandler(dependencies: CloseDependencies): () => Promise<void> {
  let pending = false;
  return async () => {
    if (pending) return;
    pending = true;
    try {
      const saved = await dependencies.readBehavior();
      const choice = saved === "ask" ? await dependencies.choose() : { behavior: saved, remember: false };
      if (!choice.behavior) return;
      if (choice.remember) await dependencies.remember(choice.behavior);
      if (choice.behavior === "frontend") dependencies.closeFrontend();
      else dependencies.quit();
    } catch (error) { dependencies.onError(error); }
    finally { pending = false; }
  };
}
