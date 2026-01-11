import { invokeLLM } from "../_core/llm";

export interface DebateContext {
  topic: string;
  previousMessages: Array<{ speaker: "pro" | "con" | "user"; message: string }>;
  userInterruption?: string;
}

export async function generateProArgument(context: DebateContext): Promise<string> {
  const systemPrompt = `You are an expert debater arguing FOR the following topic. Your arguments should be:
- Clear, concise, and compelling
- Based on logic and evidence
- Respectful but persuasive
- Limited to 2-3 sentences for pacing

Topic: ${context.topic}`;

  const userMessages = context.previousMessages
    .map((msg) => `${msg.speaker.toUpperCase()}: ${msg.message}`)
    .join("\n");

  let userPrompt = `Previous debate:\n${userMessages || "Starting the debate..."}\n\nProvide your PRO argument now:`;

  if (context.userInterruption) {
    userPrompt = `The user interrupted with: "${context.userInterruption}"\n\nRespond to their point while maintaining your PRO position, then continue the debate. Keep it to 2-3 sentences.`;
  }

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Invalid response from Gemini API");
  }

  return content.trim();
}

export async function generateConArgument(context: DebateContext): Promise<string> {
  const systemPrompt = `You are an expert debater arguing AGAINST the following topic. Your arguments should be:
- Clear, concise, and compelling
- Based on logic and evidence
- Respectful but persuasive
- Limited to 2-3 sentences for pacing

Topic: ${context.topic}`;

  const userMessages = context.previousMessages
    .map((msg) => `${msg.speaker.toUpperCase()}: ${msg.message}`)
    .join("\n");

  let userPrompt = `Previous debate:\n${userMessages || "Starting the debate..."}\n\nProvide your CON argument now:`;

  if (context.userInterruption) {
    userPrompt = `The user interrupted with: "${context.userInterruption}"\n\nRespond to their point while maintaining your CON position, then continue the debate. Keep it to 2-3 sentences.`;
  }

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Invalid response from Gemini API");
  }

  return content.trim();
}
