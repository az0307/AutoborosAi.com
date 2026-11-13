import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { apiKeys } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { decryptProviderKey, encryptProviderKey, LegacyProviderKeyError } from "./lib/provider-key-crypto";

export const apiKeyRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const keys = await db
      .select({
        id: apiKeys.id,
        provider: apiKeys.provider,
        label: apiKeys.label,
        isActive: apiKeys.isActive,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.userId, ctx.user.id));
    return keys;
  }),

  getDecrypted: authedQuery
    .input(z.object({ provider: z.enum(["claude", "openai", "gemini"]) }))
    .query(async ({ ctx, input }) => {
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

      if (keys.length === 0) return null;
      try {
        return { apiKey: decryptProviderKey(keys[0].apiKey, { userId: ctx.user.id, provider: input.provider }) };
      } catch (error) {
        if (error instanceof LegacyProviderKeyError) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: error.message });
        }
        throw error;
      }
    }),

  upsert: authedQuery
    .input(
      z.object({
        provider: z.enum(["claude", "openai", "gemini"]),
        apiKey: z.string().min(1),
        label: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const encrypted = encryptProviderKey(input.apiKey, { userId: ctx.user.id, provider: input.provider });

      const existing = await db
        .select()
        .from(apiKeys)
        .where(
          and(eq(apiKeys.userId, ctx.user.id), eq(apiKeys.provider, input.provider))
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(apiKeys)
          .set({
            apiKey: encrypted,
            label: input.label || existing[0].label,
            isActive: true,
          })
          .where(eq(apiKeys.id, existing[0].id));

        const updated = await db
          .select({
            id: apiKeys.id,
            provider: apiKeys.provider,
            label: apiKeys.label,
            isActive: apiKeys.isActive,
          })
          .from(apiKeys)
          .where(eq(apiKeys.id, existing[0].id))
          .limit(1);
        return updated[0];
      } else {
        const result = await db.insert(apiKeys).values({
          userId: ctx.user.id,
          provider: input.provider,
          apiKey: encrypted,
          label: input.label || "Default",
        });

        return {
          id: Number(result[0].insertId),
          provider: input.provider,
          label: input.label || "Default",
          isActive: true,
        };
      }
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .delete(apiKeys)
        .where(and(eq(apiKeys.id, input.id), eq(apiKeys.userId, ctx.user.id)));
      return { success: true };
    }),
});
