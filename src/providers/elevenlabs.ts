import { normalizeAlignment, type CharacterAlignment } from "@/domain";
import { ProviderRequestError } from "./errors";
import {
  elevenLabsTimestampResponseSchema,
  type ElevenLabsTtsRequest,
  type SnakeElevenLabsAlignment
} from "./schemas";

type Fetcher = typeof fetch;

export interface ElevenLabsAudioResult {
  audio: ArrayBuffer;
  contentType: string;
}

export interface ElevenLabsTimestampResult {
  audioBase64: string;
  timingAvailable: boolean;
  alignment: CharacterAlignment | null;
  normalizedAlignment: CharacterAlignment | null;
}

function textToSpeechUrl(voiceId: string, suffix = ""): string {
  return `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}${suffix}`;
}

function toCamelAlignment(input: SnakeElevenLabsAlignment | undefined): CharacterAlignment | null {
  if (!input) {
    return null;
  }

  return normalizeAlignment({
    characters: input.characters,
    characterStartTimesSeconds: input.character_start_times_seconds,
    characterEndTimesSeconds: input.character_end_times_seconds
  });
}

export async function requestElevenLabsTts(
  request: ElevenLabsTtsRequest,
  fetcher: Fetcher = fetch
): Promise<ElevenLabsAudioResult> {
  const response = await fetcher(textToSpeechUrl(request.voiceId), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "xi-api-key": request.apiKey
    },
    body: JSON.stringify({
      text: request.text,
      model_id: request.modelId
    })
  });

  if (!response.ok) {
    throw new ProviderRequestError();
  }

  return {
    audio: await response.arrayBuffer(),
    contentType: response.headers.get("content-type") ?? "audio/mpeg"
  };
}

export async function requestElevenLabsTtsWithTimestamps(
  request: ElevenLabsTtsRequest,
  fetcher: Fetcher = fetch
): Promise<ElevenLabsTimestampResult> {
  const response = await fetcher(textToSpeechUrl(request.voiceId, "/with-timestamps"), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "xi-api-key": request.apiKey
    },
    body: JSON.stringify({
      text: request.text,
      model_id: request.modelId
    })
  });

  if (!response.ok) {
    throw new ProviderRequestError();
  }

  const parsed = elevenLabsTimestampResponseSchema.parse(await response.json());
  const alignment = toCamelAlignment(parsed.alignment);
  const normalizedAlignment = toCamelAlignment(parsed.normalized_alignment);

  return {
    audioBase64: parsed.audio_base64,
    timingAvailable: Boolean(normalizedAlignment ?? alignment),
    alignment,
    normalizedAlignment
  };
}

