import { LAN_PORT } from "./ports.js";

interface LanBackend { baseUrl: string; bindHost?: string; shutdownToken: string }
interface LanRestartDependencies {
  getBackend: () => LanBackend | null;
  isStarting: () => boolean;
  requestIdleStop: (backend: LanBackend) => Promise<boolean>;
  restart: (port: number, backend: LanBackend) => Promise<void>;
}

export function createLanRestartController(dependencies: LanRestartDependencies) {
  let restarting = false;
  let error: string | undefined;
  let waiters: Array<() => void> = [];
  return {
    get restarting() { return restarting; },
    get error() { return error; },
    clearError() { error = undefined; },
    waitForIdle(): Promise<void> {
      return restarting ? new Promise((resolve) => waiters.push(resolve)) : Promise.resolve();
    },
    isPending(lanEnabled: boolean) {
      const backend = dependencies.getBackend();
      return restarting || Boolean(backend && (backend.bindHost === "0.0.0.0") !== lanEnabled);
    },
    async apply(lanEnabled: boolean) {
      const backend = dependencies.getBackend();
      if (!backend || restarting || dependencies.isStarting() || (backend.bindHost === "0.0.0.0") === lanEnabled) return;
      restarting = true;
      try {
        if (!await dependencies.requestIdleStop(backend)) return;
        if (dependencies.getBackend() !== backend || dependencies.isStarting()) return;
        await dependencies.restart(lanEnabled ? LAN_PORT : Number(new URL(backend.baseUrl).port), backend);
        error = undefined;
      } catch (cause) {
        error = cause instanceof Error ? cause.message : String(cause);
      } finally {
        restarting = false;
        const completed = waiters;
        waiters = [];
        completed.forEach((resolve) => resolve());
      }
    },
  };
}
