import net from "node:net";

export const LAN_PORT = 18473;

export async function resolveBackendPort(lanEnabled: boolean, preferredPort?: number): Promise<number> {
  if (!lanEnabled) return preferredPort ?? await findFreePort();
  await new Promise<void>((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once("error", (error: NodeJS.ErrnoException) => {
      reject(new Error(`LAN port ${LAN_PORT} is unavailable (${error.code ?? error.message})`));
    });
    server.listen(LAN_PORT, "0.0.0.0", () => {
      server.close((error) => error ? reject(error) : resolve());
    });
  });
  return LAN_PORT;
}

export function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close(() => reject(new Error("failed to allocate local port")));
        return;
      }
      server.close(() => resolve(address.port));
    });
  });
}
