import { relations } from "drizzle-orm";
import { users, apiKeys, generations, userSettings } from "./schema";

export const usersRelations = relations(users, ({ many, one }) => ({
  apiKeys: many(apiKeys),
  generations: many(generations),
  settings: one(userSettings),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));

export const generationsRelations = relations(generations, ({ one }) => ({
  user: one(users, {
    fields: [generations.userId],
    references: [users.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));
