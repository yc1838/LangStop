import { buildTokenTimeline, type TokenTiming } from "@/domain";
import type { ElevenLabsTimestampResult } from "@/providers";

export interface BrowserTts {
  speak(text: string, options: { rate: number }): Promise<void>;
}

export interface PlaySentenceInput {
  sentence: string;
  elevenLabsKey?: string;
  voiceId: string;
  modelId: string;
  speed?: number;
  requestAudio: (request: {
    apiKey: string;
    text: string;
    voiceId: string;
    modelId: string;
  }) => Promise<unknown>;
  browserTts: BrowserTts;
}

export interface PlaybackResult {
  status: "playing";
  source: "elevenlabs" | "browser_tts";
  message?: string;
}

export interface TimedPlaybackInput {
  sentence: string;
  sentenceStartedAtSeconds: number;
  timestampResponse: ElevenLabsTimestampResult;
}

export interface TimedPlaybackState {
  sentenceStartedAtSeconds: number;
  tokens: TokenTiming[];
}

export async function playSentenceWithFallback(
  input: PlaySentenceInput
): Promise<PlaybackResult> {
  const rate = input.speed ?? 1;

  if (!input.elevenLabsKey) {
    await input.browserTts.speak(input.sentence, { rate });
    return {
      status: "playing",
      source: "browser_tts",
      message: "Using browser voice."
    };
  }

  try {
    await input.requestAudio({
      apiKey: input.elevenLabsKey,
      text: input.sentence,
      voiceId: input.voiceId,
      modelId: input.modelId
    });

    return {
      status: "playing",
      source: "elevenlabs"
    };
  } catch {
    await input.browserTts.speak(input.sentence, { rate });
    return {
      status: "playing",
      source: "browser_tts",
      message: "ElevenLabs unavailable; using browser voice."
    };
  }
}

export function buildTimedPlaybackState(
  input: TimedPlaybackInput
): TimedPlaybackState | null {
  if (!input.timestampResponse.timingAvailable) {
    return null;
  }

  const alignment =
    input.timestampResponse.normalizedAlignment ?? input.timestampResponse.alignment;
  const tokens = buildTokenTimeline(input.sentence, alignment);
  if (tokens.length === 0) {
    return null;
  }

  return {
    sentenceStartedAtSeconds: input.sentenceStartedAtSeconds,
    tokens
  };
}

