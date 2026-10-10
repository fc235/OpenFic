export function validateOpenAICodexAuthorizationUrl(value: unknown): string {
  if (typeof value !== "string") throw new Error("Invalid OpenAI Codex authorization URL");
  const url = new URL(value);
  if (
    url.origin !== "https://auth.openai.com" ||
    url.pathname !== "/api/accounts/authorize" ||
    url.username || url.password
  ) throw new Error("Invalid OpenAI Codex authorization URL");
  return url.href;
}
