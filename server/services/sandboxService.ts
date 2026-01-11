import { invokeLLM } from "../_core/llm";
import { textToSpeech } from "./elevenLabsService";

type Personality = 
  | "supportive_friend"
  | "wise_mentor"
  | "patient_teacher"
  | "devils_advocate"
  | "motivational_coach"
  | "calm_therapist";

const personalityPrompts: Record<Personality, string> = {
  supportive_friend: "You are a warm, supportive friend who listens empathetically and offers encouragement. Be genuine, caring, and always have the user's best interests in mind.",
  wise_mentor: "You are a wise mentor with years of experience. Offer thoughtful guidance, share wisdom, and help the user see situations from different perspectives.",
  patient_teacher: "You are a patient teacher who explains concepts clearly and thoroughly. Break down complex ideas, use examples, and ensure understanding.",
  devils_advocate: "You are a thoughtful devil's advocate who challenges assumptions respectfully. Ask probing questions and present alternative viewpoints to help the user think critically.",
  motivational_coach: "You are an energetic motivational coach who inspires action and builds confidence. Be enthusiastic, positive, and help the user overcome obstacles.",
  calm_therapist: "You are a calm, empathetic therapist. Listen deeply, validate feelings, and help the user explore their thoughts and emotions in a safe space.",
};

export async function generateSandboxResponse(
  userMessage: string,
  personality: Personality,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<{ response: string; audioUrl: string }> {
  const systemPrompt = personalityPrompts[personality];

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...conversationHistory.map((msg) => ({
      role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
      content: msg.content,
    })),
    { role: "user" as const, content: userMessage },
  ];

  const llmResponse = await invokeLLM({
    messages: messages as any,
  });

  let response = "I'm here to listen and help.";
  const content = llmResponse.choices[0]?.message?.content;
  if (typeof content === "string") {
    response = content;
  }

  // Generate audio for the response
  let audioUrl = "";
  try {
    audioUrl = await textToSpeech(response, "user");
  } catch (error) {
    console.error("Error generating audio:", error);
    // Continue without audio if TTS fails
  }

  return { response, audioUrl };
}
