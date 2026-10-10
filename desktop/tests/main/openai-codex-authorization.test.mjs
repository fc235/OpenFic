import assert from "node:assert/strict";
import test from "node:test";

import { validateOpenAICodexAuthorizationUrl } from "../../src/main/openai-codex-authorization.ts";

test("desktop authorization accepts only the OpenAI authorization endpoint", () => {
  const url = "https://auth.openai.com/api/accounts/authorize?client_id=example&state=state&code_challenge=challenge";
  assert.equal(validateOpenAICodexAuthorizationUrl(url), url);
});

test("desktop authorization rejects other origins, endpoints, schemes and embedded credentials", () => {
  for (const value of [
    null, {}, 7, "not a URL",
    "javascript:alert(1)", "file:///C:/Windows/system.ini",
    "http://auth.openai.com/api/accounts/authorize",
    "https://auth.openai.com.evil.example/api/accounts/authorize",
    "https://evil.example/api/accounts/authorize",
    "https://auth.openai.com/api/accounts/authorize/other",
    "https://auth.openai.com/other",
    "https://user:password@auth.openai.com/api/accounts/authorize",
  ]) {
    assert.throws(() => validateOpenAICodexAuthorizationUrl(value));
  }
});
