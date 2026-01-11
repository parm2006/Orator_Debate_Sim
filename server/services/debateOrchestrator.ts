import { addDebateMessage, getDebateMessages } from "../db";
import { generateProArgument, generateConArgument, DebateContext } from "./geminiService";
import { textToSpeech } from "./elevenLabsService";

export interface DebateState {
  debateId: number;
  topic: string;
  isRunning: boolean;
  lastSpeaker: "pro" | "con" | null;
}

export async function generateNextDebateMessage(
  debateId: number,
  topic: string,
  speaker: "pro" | "con"
): Promise<{ message: string; audioUrl: string }> {
  // Get previous messages for context
  const previousMessages = await getDebateMessages(debateId);

  const context: DebateContext = {
    topic,
    previousMessages: previousMessages.map((msg) => ({
      speaker: msg.speaker as "pro" | "con" | "user",
      message: msg.message,
    })),
  };

  // Generate argument based on speaker
  let message: string;
  if (speaker === "pro") {
    message = await generateProArgument(context);
  } else {
    message = await generateConArgument(context);
  }

  // Generate audio for the message
  const audioUrl = await textToSpeech(message, speaker);

  // Save message to database
  await addDebateMessage(debateId, speaker, message, audioUrl);

  return { message, audioUrl };
}

export async function handleUserInterruption(
  debateId: number,
  topic: string,
  userMessage: string
): Promise<{ proResponse: string; conResponse: string; proAudio: string; conAudio: string }> {
  // Get previous messages for context
  const previousMessages = await getDebateMessages(debateId);

  // Save user message
  await addDebateMessage(debateId, "user", userMessage);

  const context: DebateContext = {
    topic,
    previousMessages: previousMessages.map((msg) => ({
      speaker: msg.speaker as "pro" | "con" | "user",
      message: msg.message,
    })),
    userInterruption: userMessage,
  };

  // Generate responses from both speakers
  const [proResponse, conResponse] = await Promise.all([
    generateProArgument(context),
    generateConArgument(context),
  ]);

  // Generate audio for both responses
  const [proAudio, conAudio] = await Promise.all([
    textToSpeech(proResponse, "pro"),
    textToSpeech(conResponse, "con"),
  ]);

  // Save responses to database
  await addDebateMessage(debateId, "pro", proResponse, proAudio);
  await addDebateMessage(debateId, "con", conResponse, conAudio);

  return { proResponse, conResponse, proAudio, conAudio };
}
