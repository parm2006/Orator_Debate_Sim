const DEEPGRAM_API_URL = "https://api.deepgram.com/v1";
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

export async function transcribeAudio(audioUrl: string): Promise<string> {
  if (!DEEPGRAM_API_KEY) {
    throw new Error("DEEPGRAM_API_KEY not configured");
  }

  // Call Deepgram API to transcribe audio
  const response = await fetch(`${DEEPGRAM_API_URL}/listen?model=nova-2&language=en`, {
    method: "POST",
    headers: {
      Authorization: `Token ${DEEPGRAM_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: audioUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Deepgram API error: ${response.status} - ${error}`);
  }

  const result = await response.json() as {
    results?: {
      channels?: Array<{
        alternatives?: Array<{
          transcript?: string;
        }>;
      }>;
    };
  };

  const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

  if (!transcript) {
    throw new Error("No transcript received from Deepgram");
  }

  return transcript;
}
