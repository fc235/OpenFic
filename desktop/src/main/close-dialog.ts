import { randomUUID } from "node:crypto";
import type { BrowserWindow, IpcMain, IpcMainEvent } from "electron";
import { IpcChannels, type CloseDialogChoice, type CloseDialogResponse } from "../shared/ipc.js";

const cancelled: CloseDialogChoice = { behavior: null, remember: false };

/** Only the owning shell's main frame can settle its outstanding close request. */
export function createShellCloseDialog(window: BrowserWindow, ipc: IpcMain) {
  let pending: { requestId: string; resolve: (choice: CloseDialogChoice) => void; promise: Promise<CloseDialogChoice> } | null = null;
  let ready = false;
  const authorized = (event: IpcMainEvent) => !window.isDestroyed()
    && event.sender === window.webContents && event.senderFrame === window.webContents.mainFrame
    && event.senderFrame?.url === "app://setup/ui.html";
  const settle = (choice: CloseDialogChoice) => {
    const request = pending;
    pending = null;
    request?.resolve(choice);
  };
  const send = () => {
    if (ready && pending && !window.webContents.isDestroyed()) {
      window.webContents.send(IpcChannels.closeDialogRequested, pending.requestId);
    }
  };
  const onReady = (event: IpcMainEvent) => {
    if (!authorized(event)) return;
    ready = true;
    send();
  };
  const onResolve = (event: IpcMainEvent, payload: unknown) => {
    if (!authorized(event) || !pending || !payload || typeof payload !== "object") return;
    const response = payload as CloseDialogResponse;
    if (response.requestId !== pending.requestId || typeof response.remember !== "boolean"
      || ![null, "frontend", "quit"].includes(response.behavior)) return;
    settle({ behavior: response.behavior, remember: response.behavior !== null && response.remember });
  };
  const cancel = () => { ready = false; settle(cancelled); };
  const onNavigation = (_event: unknown, _url: string, _inPlace: boolean, mainFrame: boolean) => {
    if (mainFrame) cancel();
  };
  const dispose = () => {
    cancel();
    ipc.off(IpcChannels.closeDialogReady, onReady);
    ipc.off(IpcChannels.closeDialogResolve, onResolve);
    window.webContents.off("did-start-navigation", onNavigation);
    window.webContents.off("render-process-gone", cancel);
    window.webContents.off("destroyed", dispose);
  };
  ipc.on(IpcChannels.closeDialogReady, onReady);
  ipc.on(IpcChannels.closeDialogResolve, onResolve);
  window.webContents.on("did-start-navigation", onNavigation);
  window.webContents.on("render-process-gone", cancel);
  window.webContents.once("destroyed", dispose);
  return {
    choose: (): Promise<CloseDialogChoice> => {
      if (window.isDestroyed() || window.webContents.isDestroyed()) return Promise.resolve(cancelled);
      if (pending) return pending.promise;
      let resolve!: (choice: CloseDialogChoice) => void;
      const promise = new Promise<CloseDialogChoice>((done) => { resolve = done; });
      pending = { requestId: randomUUID(), resolve, promise };
      window.focus();
      send();
      return promise;
    },
    dispose,
  };
}
