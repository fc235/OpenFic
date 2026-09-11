let worker: Worker | undefined;
let nextId = 0;
const pending = new Map<number, { resolve: (count: number) => void; fallback: number }>();

export function countTokensAsync(text: string): Promise<number> {
  if (!text.trim()) return Promise.resolve(0);
  try {
    if (!worker) {
      worker = new Worker(new URL("./token-count.worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = (event: MessageEvent<{ id: number; count: number }>) => {
        pending.get(event.data.id)?.resolve(event.data.count);
        pending.delete(event.data.id);
      };
      worker.onerror = () => {
        worker?.terminate();
        worker = undefined;
        for (const request of pending.values()) request.resolve(request.fallback);
        pending.clear();
      };
    }
    const id = ++nextId;
    return new Promise((resolve) => {
      pending.set(id, { resolve, fallback: Math.ceil(text.length / 3) });
      try {
        worker!.postMessage({ id, text });
      } catch {
        pending.delete(id);
        resolve(Math.ceil(text.length / 3));
      }
    });
  } catch {
    return Promise.resolve(Math.ceil(text.length / 3));
  }
}
