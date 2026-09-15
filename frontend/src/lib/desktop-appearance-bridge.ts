import type { LanguageCode } from "@/i18n";
import type { ThemeAppearance, ThemeVariables } from "@/lib/theme";

export interface DesktopAppearancePayload {
  appearance?: ThemeAppearance;
  fontFamily?: string;
  codeFontFamily?: string;
  themeVariables?: ThemeVariables;
  persist?: boolean;
}

export interface DesktopPreferences {
  closeBehavior: "ask" | "quit" | "frontend";
  lanEnabled: boolean;
  backendRunning: boolean;
  localBackend: boolean;
  lanPending: boolean;
  error?: string;
  addresses: Array<{ name: string; url: string }>;
}

export type DesktopPreferencesPatch = Partial<
  Pick<DesktopPreferences, "closeBehavior" | "lanEnabled">
>;

export interface SocketDiagnosticPayload {
  event:
    | "connect-start"
    | "connect-error"
    | "reconnect-attempt"
    | "reconnect-failed"
    | "connected"
    | "disconnected"
    | "connection-timeout";
  active?: boolean;
  attempt?: number;
  durationMs?: number;
  message?: string;
  transport?: string;
  url?: string;
}

declare global {
  interface Window {
    openficDesktopHost?: {
      getDesktopPreferences?: () => Promise<DesktopPreferences>;
      saveDesktopPreferences?: (patch: DesktopPreferencesPatch) => Promise<DesktopPreferences>;
      notifySessionCompleted?: (payload: {
        sessionId: string;
        completionId: string;
        title: string;
        body: string;
      }) => Promise<boolean>;
      publishAppearance: (payload: DesktopAppearancePayload) => void;
      publishLanguage: (language: LanguageCode) => void;
      publishSocketDiagnostic: (payload: SocketDiagnosticPayload) => void;
    };
  }
}

export function publishDesktopAppearance(payload: DesktopAppearancePayload): void {
  window.openficDesktopHost?.publishAppearance(payload);
}

export function publishDesktopLanguage(language: LanguageCode): void {
  window.openficDesktopHost?.publishLanguage(language);
}

export function publishSocketDiagnostic(payload: SocketDiagnosticPayload): void {
  window.openficDesktopHost?.publishSocketDiagnostic?.(payload);
}
