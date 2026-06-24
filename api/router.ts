import { authRouter } from "./auth-router";
import { settingsRouter } from "./settings-router";
import { apiKeyRouter } from "./apikey-router";
import { generationRouter } from "./generation-router";
import { aiRouter } from "./ai-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  settings: settingsRouter,
  apiKey: apiKeyRouter,
  generation: generationRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
