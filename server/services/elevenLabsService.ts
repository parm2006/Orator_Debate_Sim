import { storagePut } from "../storage";

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Voice IDs for different speakers
const VOICE_IDS = {
  pro: "EXAVITQu4vr4xnSDxMaL", // Rachel (female)
  con: "TxGEqnHWrfWFTfGW9XjX", // Callum (male)
  user: "21m00Tcm4TlvDq8ikWAM", // George (male)
};

export async function textToSpeech(text: string, speaker: "pro" | "con" | "user"): Promise<string> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY not configured");
  }

  const voiceId = VOICE_IDS[speaker];

  // Call ElevenLabs API to generate speech
  const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: text,
      model_id: "eleven_turbo_v2_5",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`ElevenLabs API error: ${response.status} - ${error}`);
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
  }

  const audioBuffer = await response.arrayBuffer();

  // Upload audio to S3
  const timestamp = Date.now();
  const fileKey = `debate-audio/${speaker}-${timestamp}-${Math.random().toString(36).substr(2, 9)}.mp3`;
  const { url } = await storagePut(fileKey, new Uint8Array(audioBuffer), "audio/mpeg");

  return url;
}
