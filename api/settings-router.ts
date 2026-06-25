import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { userSettings } from "@db/schema";
import { eq } from "drizzle-orm";

export const settingsRouter = createRouter({
  get: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const settings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, ctx.user.id))
      .limit(1);
    return settings[0] ?? null;
  }),

  upsert: authedQuery
    .input(
      z.object({
        defaultProvider: z.enum(["claude", "openai", "gemini"]).optional(),
        defaultExportFormat: z.enum(["pdf", "json", "text"]).optional(),
        theme: z.enum(["dark", "light"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, ctx.user.id))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(userSettings)
          .set(input)
          .where(eq(userSettings.userId, ctx.user.id));
        const updated = await db
          .select()
          .from(userSettings)
          .where(eq(userSettings.userId, ctx.user.id))
          .limit(1);
        return updated[0];
      } else {
        await db.insert(userSettings).values({
          userId: ctx.user.id,
          ...input,
        });
        const created = await db
          .select()
          .from(userSettings)
          .where(eq(userSettings.userId, ctx.user.id))
          .limit(1);
        return created[0];
      }
    }),
});
