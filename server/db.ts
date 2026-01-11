import { asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, debates, debateMessages, Debate } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createDebate(userId: number, topic: string): Promise<Debate> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(debates).values({ userId, topic, status: "active" });
  const debateId = result[0].insertId;
  const debate = await db.select().from(debates).where(eq(debates.id, debateId as number)).limit(1);
  return debate[0]!;
}

export async function getDebateById(debateId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(debates).where(eq(debates.id, debateId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserDebates(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(debates).where(eq(debates.userId, userId)).orderBy(desc(debates.createdAt));
}

export async function addDebateMessage(debateId: number, speaker: "pro" | "con" | "user", message: string, audioUrl?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(debateMessages).values({ debateId, speaker, message, audioUrl });
  const messageId = result[0].insertId;
  const msg = await db.select().from(debateMessages).where(eq(debateMessages.id, messageId as number)).limit(1);
  return msg[0]!;
}

export async function getDebateMessages(debateId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(debateMessages).where(eq(debateMessages.debateId, debateId)).orderBy(asc(debateMessages.createdAt));
}

export async function updateDebateStatus(debateId: number, status: "active" | "paused" | "completed") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(debates).set({ status }).where(eq(debates.id, debateId));
}
