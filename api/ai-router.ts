import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { apiKeys } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const ENC_KEY = process.env.APP_SECRET || "default-key-change-me";

function xorDecrypt(encrypted: string, key: string): string {
  const text = Buffer.from(encrypted, "base64").toString("binary");
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

interface ProviderConfig {
  baseUrl: string;
  getBody: (system: string, user: string, model?: string) => unknown;
  getHeaders: (apiKey: string) => Record<string, string>;
  extractText: (data: unknown) => string;
}

const PROVIDERS: Record<string, ProviderConfig> = {
  claude: {
    baseUrl: "https://api.anthropic.com/v1/messages",
    getBody: (system, user, model = "claude-sonnet-4-20250514") => ({
      model,
      max_tokens: 2000,
      system,
      messages: [{ role: "user", content: user }],
    }),
    getHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    }),
    extractText: (data: unknown) => {
      const d = data as { content?: Array<{ text?: string }> };
      return d.content?.[0]?.text || "";
    },
  },
  openai: {
    baseUrl: "https://api.openai.com/v1/chat/completions",
    getBody: (system, user, model = "gpt-4o") => ({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: 2000,
    }),
    getHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    extractText: (data: unknown) => {
      const d = data as { choices?: Array<{ message?: { content?: string } }> };
      return d.choices?.[0]?.message?.content || "";
    },
  },
  gemini: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent",
    getBody: (system, user) => ({
      contents: [
        { role: "user", parts: [{ text: `${system}\n\n${user}` }] },
      ],
      generationConfig: { maxOutputTokens: 2000 },
    }),
    getHeaders: (_apiKey) => ({
      "Content-Type": "application/json",
    }),
    extractText: (data: unknown) => {
      const d = data as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      return d.candidates?.[0]?.content?.parts?.[0]?.text || "";
    },
  },
};

export const aiRouter = createRouter({
  generate: publicQuery
    .input(
      z.object({
        provider: z.enum(["claude", "openai", "gemini"]),
        systemPrompt: z.string(),
        userPrompt: z.string(),
        model: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Look up API key
      let apiKey: string | null = null;

      if (ctx.user) {
        const db = getDb();
        const keys = await db
          .select()
          .from(apiKeys)
          .where(
            and(
              eq(apiKeys.userId, ctx.user.id),
              eq(apiKeys.provider, input.provider),
              eq(apiKeys.isActive, true)
            )
          )
          .limit(1);

        if (keys.length > 0) {
          apiKey = xorDecrypt(keys[0].apiKey, ENC_KEY);
        }
      }

      if (!apiKey) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `No API key configured for ${input.provider}. Please add one in Settings.`,
        });
      }

      const config = PROVIDERS[input.provider];
      const url =
        input.provider === "gemini"
          ? `${config.baseUrl}?key=${apiKey}`
          : config.baseUrl;

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: config.getHeaders(apiKey),
          body: JSON.stringify(config.getBody(input.systemPrompt, input.userPrompt, input.model)),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `AI API error (${res.status}): ${errorText}`,
          });
        }

        const data = await res.json();
        const text = config.extractText(data);

        return { text };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }),
});
