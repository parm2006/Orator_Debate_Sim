import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const debates = mysqlTable("debates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topic: text("topic").notNull(),
  status: mysqlEnum("status", ["active", "paused", "completed"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Debate = typeof debates.$inferSelect;
export type InsertDebate = typeof debates.$inferInsert;

export const debateMessages = mysqlTable("debateMessages", {
  id: int("id").autoincrement().primaryKey(),
  debateId: int("debateId").notNull(),
  speaker: mysqlEnum("speaker", ["pro", "con", "user"]).notNull(),
  message: text("message").notNull(),
  audioUrl: varchar("audioUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DebateMessage = typeof debateMessages.$inferSelect;
export type InsertDebateMessage = typeof debateMessages.$inferInsert;

export const sandboxConversations = mysqlTable("sandboxConversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  personality: mysqlEnum("personality", [
    "supportive_friend",
    "wise_mentor",
    "patient_teacher",
    "devils_advocate",
    "motivational_coach",
    "calm_therapist",
  ]).notNull(),
  title: varchar("title", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SandboxConversation = typeof sandboxConversations.$inferSelect;
export type InsertSandboxConversation = typeof sandboxConversations.$inferInsert;

export const sandboxMessages = mysqlTable("sandboxMessages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  speaker: mysqlEnum("speaker", ["user", "ai"]).notNull(),
  message: text("message").notNull(),
  audioUrl: varchar("audioUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SandboxMessage = typeof sandboxMessages.$inferSelect;
export type InsertSandboxMessage = typeof sandboxMessages.$inferInsert;

export const dojoPracticeSessions = mysqlTable("dojoPracticeSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  scenario: varchar("scenario", { length: 255 }).notNull(),
  description: text("description"),
  score: int("score").default(0).notNull(),
  status: mysqlEnum("status", ["in_progress", "completed"]).default("in_progress").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DojoPracticeSession = typeof dojoPracticeSessions.$inferSelect;
export type InsertDojoPracticeSession = typeof dojoPracticeSessions.$inferInsert;

export const dojoMessages = mysqlTable("dojoMessages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  speaker: mysqlEnum("speaker", ["user", "ai"]).notNull(),
  message: text("message").notNull(),
  audioUrl: varchar("audioUrl", { length: 512 }),
  score: int("score").default(0).notNull(),
  feedback: text("feedback"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DojoMessage = typeof dojoMessages.$inferSelect;
export type InsertDojoMessage = typeof dojoMessages.$inferInsert;
