export type CloseBehavior = "ask" | "quit" | "frontend";

export interface DesktopPreferences {
  closeBehavior: CloseBehavior;
  lanEnabled: boolean;
}

export interface DesktopPreferencesState extends DesktopPreferences {
  backendRunning: boolean;
  localBackend: boolean;
  lanPending: boolean;
  addresses: Array<{ name: string; url: string }>;
  error?: string;
}
