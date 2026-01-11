import { describe, expect, it } from "vitest";

describe("API Credentials Validation", () => {
  it("should have Gemini API key configured", () => {
    const key = process.env.GEMINI_API_KEY;
    expect(key).toBeDefined();
    expect(key).toBeTruthy();
    expect(typeof key).toBe("string");
    expect(key!.length).toBeGreaterThan(0);
  });

  it("should have ElevenLabs API key configured", () => {
    const key = process.env.ELEVENLABS_API_KEY;
    expect(key).toBeDefined();
    expect(key).toBeTruthy();
    expect(typeof key).toBe("string");
    expect(key!.length).toBeGreaterThan(0);
  });

  it("should have Deepgram API key configured", () => {
    const key = process.env.DEEPGRAM_API_KEY;
    expect(key).toBeDefined();
    expect(key).toBeTruthy();
    expect(typeof key).toBe("string");
    expect(key!.length).toBeGreaterThan(0);
  });

  it("should have valid ElevenLabs API key format", () => {
    const key = process.env.ELEVENLABS_API_KEY;
    expect(key).toBeDefined();
    expect(key).toBeTruthy();
    // ElevenLabs keys are typically 64-character hex strings
    expect(key!).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should validate Gemini API key works", async () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY not set");

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + key,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Say hello" }] }],
        }),
      }
    );

    // Gemini should not reject the key
    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(403);
  });

  it("should validate Deepgram API key works", async () => {
    const key = process.env.DEEPGRAM_API_KEY;
    if (!key) throw new Error("DEEPGRAM_API_KEY not set");

    const response = await fetch("https://api.deepgram.com/v1/models", {
      method: "GET",
      headers: { Authorization: `Token ${key}` },
    });

    // Deepgram should not reject the key
    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(403);
  });
});
