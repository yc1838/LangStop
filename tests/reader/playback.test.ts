import { describe, expect, it, vi } from "vitest";
import { buildTimedPlaybackState, playSentenceWithFallback } from "@/reader";

describe("reader playback", () => {
  it("falls back to browser TTS when ElevenLabs audio fails", async () => {
    const speak = vi.fn().mockResolvedValue(undefined);

    const result = await playSentenceWithFallback({
      sentence: "Bonjour.",
      elevenLabsKey: "bad-key",
      voiceId: "voice-1",
      modelId: "eleven_flash_v2_5",
      requestAudio: vi.fn().mockRejectedValue(new Error("quota")),
      browserTts: { speak }
    });

    expect(speak).toHaveBeenCalledWith("Bonjour.", { rate: 1 });
    expect(result).toEqual({
      status: "playing",
      source: "browser_tts",
      message: "ElevenLabs unavailable; using browser voice."
    });
  });

  it("uses browser TTS immediately when no ElevenLabs key is available", async () => {
    const requestAudio = vi.fn();
    const speak = vi.fn().mockResolvedValue(undefined);

    const result = await playSentenceWithFallback({
      sentence: "Bonjour.",
      elevenLabsKey: "",
      voiceId: "voice-1",
      modelId: "eleven_flash_v2_5",
      requestAudio,
      browserTts: { speak },
      speed: 1.25
    });

    expect(requestAudio).not.toHaveBeenCalled();
    expect(speak).toHaveBeenCalledWith("Bonjour.", { rate: 1.25 });
    expect(result.source).toBe("browser_tts");
  });

  it("builds timed playback state from timestamp alignment", () => {
    const timed = buildTimedPlaybackState({
      sentence: "hello world",
      sentenceStartedAtSeconds: 10,
      timestampResponse: {
        audioBase64: "abc",
        timingAvailable: true,
        alignment: {
          characters: Array.from("hello world"),
          characterStartTimesSeconds: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.36, 0.42, 0.48, 0.54],
          characterEndTimesSeconds: [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.36, 0.42, 0.48, 0.54, 0.6]
        },
        normalizedAlignment: null
      }
    });

    expect(timed?.sentenceStartedAtSeconds).toBe(10);
    expect(timed?.tokens.map((token) => token.text)).toEqual(["hello", "world"]);
  });
});

