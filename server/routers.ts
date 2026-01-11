import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { createDebate, getDebateById, getUserDebates, getDebateMessages } from "./db";
import { generateNextDebateMessage, handleUserInterruption } from "./services/debateOrchestrator";
import { generateSandboxResponse } from "./services/sandboxService";
import { generateDojoResponse, dojoScenarios, type ScenarioKey } from "./services/dojoService";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  debate: router({
    create: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "topic" in val) {
          const obj = val as Record<string, unknown>;
          if (typeof obj.topic === "string") {
            return { topic: obj.topic };
          }
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ ctx, input }) => {
        return createDebate(ctx.user.id, input.topic);
      }),

    getById: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "debateId" in val) {
          const obj = val as Record<string, unknown>;
          if (typeof obj.debateId === "number") {
            return { debateId: obj.debateId };
          }
        }
        throw new Error("Invalid input");
      })
      .query(async ({ input }) => {
        return getDebateById(input.debateId);
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserDebates(ctx.user.id);
    }),

    getMessages: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "debateId" in val) {
          const obj = val as Record<string, unknown>;
          if (typeof obj.debateId === "number") {
            return { debateId: obj.debateId };
          }
        }
        throw new Error("Invalid input");
      })
      .query(async ({ input }) => {
        return getDebateMessages(input.debateId);
      }),

    generateNextMessage: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "debateId" in val && "topic" in val && "speaker" in val) {
          const obj = val as Record<string, unknown>;
          if (typeof obj.debateId === "number" && typeof obj.topic === "string" && (obj.speaker === "pro" || obj.speaker === "con")) {
            return { debateId: obj.debateId, topic: obj.topic, speaker: obj.speaker as "pro" | "con" };
          }
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input }) => {
        return generateNextDebateMessage(input.debateId, input.topic, input.speaker);
      }),

    handleInterruption: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "debateId" in val && "topic" in val && "userMessage" in val) {
          const obj = val as Record<string, unknown>;
          if (typeof obj.debateId === "number" && typeof obj.topic === "string" && typeof obj.userMessage === "string") {
            return { debateId: obj.debateId, topic: obj.topic, userMessage: obj.userMessage };
          }
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input }) => {
        return handleUserInterruption(input.debateId, input.topic, input.userMessage);
      }),
  }),

  sandbox: router({
    respond: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "message" in val && "personality" in val) {
          const obj = val as Record<string, unknown>;
          if (typeof obj.message === "string" && typeof obj.personality === "string") {
            return { message: obj.message, personality: obj.personality as any, history: (obj.history as any) || [] };
          }
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input }) => {
        return generateSandboxResponse(input.message, input.personality, input.history);
      }),
  }),

  dojo: router({
    getScenarios: publicProcedure.query(() => {
      return Object.entries(dojoScenarios).map(([key, value]) => ({
        id: key,
        ...value,
      }));
    }),

    respond: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "message" in val && "scenario" in val) {
          const obj = val as Record<string, unknown>;
          if (typeof obj.message === "string" && typeof obj.scenario === "string") {
            return { message: obj.message, scenario: obj.scenario as ScenarioKey, history: (obj.history as any) || [] };
          }
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input }) => {
        return generateDojoResponse(input.message, input.scenario, input.history);
      }),
  }),
});

export type AppRouter = typeof appRouter;
