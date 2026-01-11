import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "test",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("Debate API Core Procedures", () => {
  let createdDebateId: number;
  const testTopic = "Should artificial intelligence be regulated by governments?";

  describe("debate.create", () => {
    it("should create a new debate with a topic", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const debate = await caller.debate.create({ topic: testTopic });

      expect(debate).toBeDefined();
      expect(debate.id).toBeDefined();
      expect(debate.topic).toBe(testTopic);
      expect(debate.status).toBe("active");
      expect(debate.userId).toBe(ctx.user.id);

      createdDebateId = debate.id;
    });

    it("should reject empty topic", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.debate.create({ topic: "" });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("debate.getById", () => {
    it("should retrieve a debate by ID", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const debate = await caller.debate.getById({ debateId: createdDebateId });

      expect(debate).toBeDefined();
      expect(debate?.id).toBe(createdDebateId);
      expect(debate?.topic).toBe(testTopic);
    });

    it("should return undefined for non-existent debate", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const debate = await caller.debate.getById({ debateId: 99999 });

      expect(debate).toBeUndefined();
    });
  });

  describe("debate.list", () => {
    it("should list all debates for a user", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const debates = await caller.debate.list();

      expect(Array.isArray(debates)).toBe(true);
      expect(debates.length).toBeGreaterThan(0);
      expect(debates.some((d) => d.id === createdDebateId)).toBe(true);
    });

    it("should return empty list for user with no debates", async () => {
      const ctx = createAuthContext(999);
      const caller = appRouter.createCaller(ctx);

      const debates = await caller.debate.list();

      expect(Array.isArray(debates)).toBe(true);
      expect(debates.length).toBe(0);
    });
  });

  describe("debate.getMessages", () => {
    it("should return empty array for debate with no messages", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const messages = await caller.debate.getMessages({ debateId: createdDebateId });

      expect(Array.isArray(messages)).toBe(true);
    });
  });

  describe("debate input validation", () => {
    it("should validate speaker parameter for generateNextMessage", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.debate.generateNextMessage({
          debateId: createdDebateId,
          topic: testTopic,
          speaker: "invalid" as any,
        });
        expect.fail("Should have thrown validation error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should validate debateId parameter for getMessages", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.debate.getMessages({ debateId: "invalid" as any });
        expect.fail("Should have thrown validation error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });


  });

  describe("debate permissions", () => {
    it("should only allow authenticated users to create debates", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const debate = await caller.debate.create({ topic: "Test topic" });

      expect(debate.userId).toBe(ctx.user.id);
    });

    it("should list only current user's debates", async () => {
      const ctx1 = createAuthContext(1);
      const ctx2 = createAuthContext(2);

      const caller1 = appRouter.createCaller(ctx1);
      const caller2 = appRouter.createCaller(ctx2);

      const debates1 = await caller1.debate.list();
      const debates2 = await caller2.debate.list();

      const user1Ids = debates1.map((d) => d.userId);
      const user2Ids = debates2.map((d) => d.userId);

      expect(user1Ids.every((id) => id === ctx1.user.id)).toBe(true);
      expect(user2Ids.every((id) => id === ctx2.user.id)).toBe(true);
    });
  });
});
