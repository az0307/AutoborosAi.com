import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { generations } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

export const generationRouter = createRouter({
  list: publicQuery
    .input(
      z
        .object({
          toolType: z.enum(["social", "quote", "email", "report"]).optional(),
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;

      if (!ctx.user) {
        return { items: [], total: 0 };
      }

      const conditions = [eq(generations.userId, ctx.user.id)];
      if (input?.toolType) {
        conditions.push(eq(generations.toolType, input.toolType));
      }

      const items = await db
        .select()
        .from(generations)
        .where(and(...conditions))
        .orderBy(desc(generations.createdAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: generations.id })
        .from(generations)
        .where(and(...conditions));

      return { items, total: countResult.length };
    }),

  create: publicQuery
    .input(
      z.object({
        toolType: z.enum(["social", "quote", "email", "report"]),
        title: z.string(),
        promptData: z.any(),
        outputText: z.string(),
      })
    )
    .mutation(async ({ ctx: _ctx, input }) => {
      const db = getDb();
      const result = await db.insert(generations).values({
        userId: _ctx.user?.id ?? null,
        toolType: input.toolType,
        title: input.title,
        promptData: input.promptData,
        outputText: input.outputText,
      });

      const created = await db
        .select()
        .from(generations)
        .where(eq(generations.id, Number(result[0].insertId)))
        .limit(1);

      return created[0];
    }),

  toggleFavorite: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx: _ctx, input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(generations)
        .where(eq(generations.id, input.id))
        .limit(1);

      if (existing.length === 0) throw new Error("Generation not found");

      const newValue = !existing[0].isFavorite;
      await db
        .update(generations)
        .set({ isFavorite: newValue })
        .where(eq(generations.id, input.id));

      return { ...existing[0], isFavorite: newValue };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx: _ctx, input }) => {
      const db = getDb();
      await db.delete(generations).where(eq(generations.id, input.id));
      return { success: true };
    }),
});
