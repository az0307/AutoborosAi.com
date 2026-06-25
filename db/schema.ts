import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  json,
  boolean,
  bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const apiKeys = mysqlTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).references(() => users.id),
  provider: mysqlEnum("provider", ["claude", "openai", "gemini"]).notNull(),
  apiKey: text("apiKey").notNull(),
  label: varchar("label", { length: 255 }).default("Default"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

export const generations = mysqlTable("generations", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).references(() => users.id),
  toolType: mysqlEnum("toolType", ["social", "quote", "email", "report"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  promptData: json("promptData").notNull(),
  outputText: text("outputText").notNull(),
  isFavorite: boolean("isFavorite").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Generation = typeof generations.$inferSelect;
export type InsertGeneration = typeof generations.$inferInsert;

export const userSettings = mysqlTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).references(() => users.id).unique(),
  defaultProvider: mysqlEnum("defaultProvider", ["claude", "openai", "gemini"]).default("claude"),
  defaultExportFormat: mysqlEnum("defaultExportFormat", ["pdf", "json", "text"]).default("pdf"),
  theme: mysqlEnum("theme", ["dark", "light"]).default("dark"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;
