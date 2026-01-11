import { invokeLLM } from "../_core/llm";
import { textToSpeech } from "./elevenLabsService";

export const dojoScenarios = {
  salary_negotiation: {
    title: "Salary Negotiation",
    description: "Practice negotiating a salary increase with your boss",
    systemPrompt:
      "You are a skeptical but fair boss. The employee is asking for a raise. Be realistic, ask tough questions, but be open to negotiation. Evaluate their arguments and respond professionally.",
  },
  job_interview: {
    title: "Job Interview",
    description: "Practice answering tough interview questions",
    systemPrompt:
      "You are an experienced interviewer conducting a job interview. Ask probing questions, listen carefully to responses, and evaluate the candidate's fit. Be professional but challenging.",
  },
  breakup_conversation: {
    title: "Breakup Conversation",
    description: "Practice having a difficult breakup conversation",
    systemPrompt:
      "You are someone in a relationship. The other person wants to have a serious conversation. Listen empathetically, respond honestly, and navigate this difficult conversation with maturity and care.",
  },
  difficult_feedback: {
    title: "Difficult Feedback",
    description: "Practice giving or receiving critical feedback",
    systemPrompt:
      "You are a manager or colleague receiving/giving difficult feedback. Be constructive, specific, and professional. Help the person understand the feedback and work toward improvement.",
  },
  conflict_resolution: {
    title: "Conflict Resolution",
    description: "Practice resolving a workplace conflict",
    systemPrompt:
      "You are involved in a workplace conflict. Listen to the other person's perspective, express your concerns clearly, and work toward finding common ground and a solution.",
  },
  client_complaint: {
    title: "Client Complaint",
    description: "Practice handling an upset client",
    systemPrompt:
      "You are a client who is upset about a service or product. Express your concerns clearly, listen to solutions, and evaluate whether the company is addressing your needs adequately.",
  },
};

export type ScenarioKey = keyof typeof dojoScenarios;

export async function generateDojoResponse(
  userMessage: string,
  scenario: ScenarioKey,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<{ response: string; audioUrl: string; score: number; feedback: string }> {
  const scenarioConfig = dojoScenarios[scenario];
  if (!scenarioConfig) {
    throw new Error(`Unknown scenario: ${scenario}`);
  }

  const scoringPrompt = `
After responding to the user's message, evaluate their response on a scale of 1-100 based on:
- Clarity and articulation (20 points)
- Emotional intelligence and empathy (20 points)
- Assertiveness and confidence (20 points)
- Problem-solving approach (20 points)
- Professional tone and language (20 points)

Provide your response first, then on a new line write "SCORE: X" where X is 1-100.
Then provide brief feedback on what they did well and what could be improved.`;

  const messages = [
    { role: "system" as const, content: `${scenarioConfig.systemPrompt}\n\n${scoringPrompt}` },
    ...conversationHistory.map((msg) => ({
      role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
      content: msg.content,
    })),
    { role: "user" as const, content: userMessage },
  ];

  const llmResponse = await invokeLLM({
    messages: messages as any,
  });

  let fullResponse = "I appreciate your input. Let me respond to that.";
  const content = llmResponse.choices[0]?.message?.content;
  if (typeof content === "string") {
    fullResponse = content;
  }

  // Parse score and feedback from response
  const scoreMatch = fullResponse.match(/SCORE:\s*(\d+)/);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;

  // Extract feedback (text after SCORE line)
  const feedbackMatch = fullResponse.match(/SCORE:\s*\d+\n([\s\S]*?)$/);
  const feedback = feedbackMatch ? feedbackMatch[1].trim() : "Good effort!";

  // Remove score and feedback from response for display
  const response = fullResponse
    .replace(/SCORE:\s*\d+[\s\S]*$/, "")
    .trim();

  // Generate audio for the response
  let audioUrl = "";
  try {
    audioUrl = await textToSpeech(response, "con");
  } catch (error) {
    console.error("Error generating audio:", error);
    // Continue without audio if TTS fails
  }

  return { response, audioUrl, score: Math.min(100, Math.max(1, score)), feedback };
}
