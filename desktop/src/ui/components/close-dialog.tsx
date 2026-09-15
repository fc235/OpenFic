import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Monitor, Power } from "lucide-react";
import type { CloseDialogChoice } from "../../shared/ipc";
import "./close-dialog.css";

export function CloseDialog() {
  const { t } = useTranslation();
  const dialog = useRef<HTMLDialogElement>(null);
  const activeRequest = useRef<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [behavior, setBehavior] = useState<"frontend" | "quit">("frontend");
  const [remember, setRemember] = useState(false);

  useEffect(() => window.openficDesktop.onCloseDialogRequested((id) => {
    if (activeRequest.current === id) return;
    activeRequest.current = id;
    setBehavior("frontend");
    setRemember(false);
    setRequestId(id);
  }), []);

  useEffect(() => {
    if (!requestId) return;
    const element = dialog.current!;
    const previousFocus = document.activeElement as HTMLElement | null;
    element.showModal();
    element.querySelector<HTMLInputElement>("input:checked")?.focus();
    return () => {
      element.close();
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [requestId]);

  const resolve = (choice: CloseDialogChoice["behavior"]) => {
    if (!requestId) return;
    window.openficDesktop.resolveCloseDialog({ requestId, behavior: choice, remember: choice !== null && remember });
    activeRequest.current = null;
    setRequestId(null);
  };

  return (
    <dialog ref={dialog} className="desktop-close-dialog" aria-labelledby="desktop-close-title"
      aria-describedby="desktop-close-description"
      onCancel={(event) => { event.preventDefault(); resolve(null); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) resolve(null);
      }}>
      <h2 id="desktop-close-title">{t("desktop.close.title")}</h2>
      <p id="desktop-close-description">{t("desktop.close.description")}</p>
      <div className="desktop-close-options" role="radiogroup" aria-label={t("desktop.close.description")}>
        {(["frontend", "quit"] as const).map((option) => (
          <label key={option} className="desktop-close-option" data-selected={behavior === option}>
            <input type="radio" name="desktop-close-behavior" value={option} checked={behavior === option}
              onChange={() => setBehavior(option)} />
            {option === "frontend" ? <Monitor size={20} aria-hidden="true" /> : <Power size={20} aria-hidden="true" />}
            <span><strong>{t(`desktop.close.${option}`)}</strong><small>{t(`desktop.close.${option}Description`)}</small></span>
          </label>
        ))}
      </div>
      <label className="desktop-close-remember">
        <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
        <span>{t("desktop.close.remember")}</span>
      </label>
      <div className="desktop-close-actions">
        <button type="button" onClick={() => resolve(null)}>{t("desktop.common.cancel")}</button>
        <button type="button" className="desktop-close-confirm" onClick={() => resolve(behavior)}>{t(`desktop.close.${behavior}`)}</button>
      </div>
    </dialog>
  );
}
