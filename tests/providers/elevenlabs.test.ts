import { describe, expect, it, vi } from "vitest";
import {
  requestElevenLabsTts,
  requestElevenLabsTtsWithTimestamps
} from "@/providers";

describe("ElevenLabs provider adapter", () => {
  it("sends sentence TTS requests with user key and returns audio bytes", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { "content-type": "audio/mpeg" }
      })
    );

    const result = await requestElevenLabsTts(
      {
        apiKey: "eleven-key",
        text: "Bonjour.",
        voiceId: "voice-1",
        modelId: "eleven_flash_v2_5"
      },
      fetcher
    );

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.elevenlabs.io/v1/text-to-speech/voice-1",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "xi-api-key": "eleven-key",
          "content-type": "application/json"
        }),
        body: JSON.stringify({
          text: "Bonjour.",
          model_id: "eleven_flash_v2_5"
        })
      })
    );
    expect(Array.from(new Uint8Array(result.audio))).toEqual([1, 2, 3]);
    expect(result.contentType).toBe("audio/mpeg");
  });

  it("normalizes timestamp responses and marks timing available", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      Response.json({
        audio_base64: "abc123",
        alignment: {
          characters: ["B"],
          character_start_times_seconds: [0],
          character_end_times_seconds: [0.1]
        },
        normalized_alignment: {
          characters: ["B"],
          character_start_times_seconds: [0],
          character_end_times_seconds: [0.1]
        }
      })
    );

    const result = await requestElevenLabsTtsWithTimestamps(
      {
        apiKey: "eleven-key",
        text: "Bonjour.",
        voiceId: "voice-1",
        modelId: "eleven_flash_v2_5"
      },
      fetcher
    );

    expect(result).toEqual({
      audioBase64: "abc123",
      timingAvailable: true,
      alignment: {
        characters: ["B"],
        characterStartTimesSeconds: [0],
        characterEndTimesSeconds: [0.1]
      },
      normalizedAlignment: {
        characters: ["B"],
        characterStartTimesSeconds: [0],
        characterEndTimesSeconds: [0.1]
      }
    });
  });

  it("treats missing timestamp alignment as a normal fallback state", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ audio_base64: "abc123" }));

    const result = await requestElevenLabsTtsWithTimestamps(
      {
        apiKey: "eleven-key",
        text: "Bonjour.",
        voiceId: "voice-1",
        modelId: "eleven_flash_v2_5"
      },
      fetcher
    );

    expect(result).toEqual({
      audioBase64: "abc123",
      timingAvailable: false,
      alignment: null,
      normalizedAlignment: null
    });
  });
});

