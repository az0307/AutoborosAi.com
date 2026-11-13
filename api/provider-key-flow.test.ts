import { afterEach, expect, it, vi } from "vitest";
import { decryptProviderKey, encryptProviderKey } from "./lib/provider-key-crypto";

// Replace database/network boundaries only; exercise real tRPC auth and crypto.
const state = vi.hoisted(() => ({ rows: [] as Array<Record<string, unknown>> }));
vi.mock("./queries/connection", () => ({
  getDb: () => ({
    select: () => ({ from: () => ({ where: () => ({ limit: async () => state.rows }) }) }),
    update: () => ({ set: (values: Record<string, unknown>) => ({ where: async () => Object.assign(state.rows[0], values) }) }),
    insert: () => ({ values: async (values: Record<string, unknown>) => {
      state.rows.push({ id: 1, ...values });
      return [{ insertId: 1 }];
    } }),
  }),
}));

import { apiKeyRouter } from "./apikey-router";
import { aiRouter } from "./ai-router";

const identity = { userId: 42, provider: "openai" };
const context = { user: { id: 42 } } as Parameters<typeof apiKeyRouter.createCaller>[0];
const input = { provider: "openai" as const, systemPrompt: "system", userPrompt: "hello" };
const originalKey = process.env.API_KEY_ENCRYPTION_KEY;
afterEach(() => {
  state.rows = [];
  if (originalKey === undefined) delete process.env.API_KEY_ENCRYPTION_KEY;
  else process.env.API_KEY_ENCRYPTION_KEY = originalKey;
  vi.unstubAllGlobals();
});

it("stores authenticated ciphertext and uses the recovered key for generation", async () => {
  process.env.API_KEY_ENCRYPTION_KEY = Buffer.alloc(32, 9).toString("base64");
  const saved = await apiKeyRouter.createCaller(context).upsert({ provider: "openai", apiKey: "new-provider-secret" });
  expect(saved).not.toHaveProperty("apiKey");
  expect(state.rows[0].apiKey).not.toBe("new-provider-secret");
  expect(decryptProviderKey(state.rows[0].apiKey as string, identity)).toBe("new-provider-secret");
  let authorization: string | undefined;
  vi.stubGlobal("fetch", async (_url: string, init: RequestInit) => {
    authorization = (init.headers as Record<string, string>).Authorization;
    return new Response(JSON.stringify({ choices: [{ message: { content: "generated output" } }] }));
  });
  expect(await aiRouter.createCaller(context).generate(input)).toEqual({ text: "generated output" });
  expect(authorization).toBe("Bearer new-provider-secret");
});

it("blocks legacy generation until re-entry replaces the stored record", async () => {
  process.env.API_KEY_ENCRYPTION_KEY = Buffer.alloc(32, 9).toString("base64");
  state.rows = [{ id: 1, apiKey: "old-xor-record", label: "Existing" }];
  const read = apiKeyRouter.createCaller(context);
  await expect(read.getDecrypted({ provider: "openai" })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  await expect(aiRouter.createCaller(context).generate(input)).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  await read.upsert({ provider: "openai", apiKey: "replacement-secret" });
  expect(state.rows).toHaveLength(1);
  expect(await read.getDecrypted({ provider: "openai" })).toEqual({ apiKey: "replacement-secret" });
});

it("never forwards a key bound to a different owner", async () => {
  process.env.API_KEY_ENCRYPTION_KEY = Buffer.alloc(32, 9).toString("base64");
  state.rows = [{ apiKey: encryptProviderKey("other-secret", { ...identity, userId: 99 }) }];
  let requests = 0;
  vi.stubGlobal("fetch", () => { requests++; throw new Error("Unexpected provider request"); });
  await expect(aiRouter.createCaller(context).generate(input)).rejects.toThrow();
  expect(requests).toBe(0);
});

it("requires authentication to store or recover provider keys", async () => {
  const caller = apiKeyRouter.createCaller({ req: new Request("https://app.invalid"), resHeaders: new Headers() });
  await expect(caller.upsert({ provider: "openai", apiKey: "secret" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  await expect(caller.getDecrypted({ provider: "openai" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
});
