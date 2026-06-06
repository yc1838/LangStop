import { z } from "zod";

export const llmProviderSchema = z.enum([
  "deepseek",
  "kimi",
  "openai",
  "claude",
  "gemini",
  "custom"
]);

export type LlmProviderId = z.infer<typeof llmProviderSchema>;

export const commandTargetSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("whole_sentence"),
    text: z.string().optional()
  }),
  z.object({
    mode: z.literal("word_at_offset"),
    offset: z.number().int(),
    text: z.string().optional()
  })
]);

export const elevenLabsTtsRequestSchema = z.object({
  apiKey: z.string().min(1),
  text: z.string().min(1),
  voiceId: z.string().min(1),
  modelId: z.string().min(1)
});

export type ElevenLabsTtsRequest = z.infer<typeof elevenLabsTtsRequestSchema>;

export const llmCommandRequestSchema = z.object({
  provider: llmProviderSchema,
  apiKey: z.string().min(1),
  model: z.string().min(1),
  baseUrl: z.string().url().optional(),
  transcript: z.string().min(1),
  readerState: z.object({
    currentSentence: z.string().min(1),
    interruptionToken: z.string().optional(),
    selectedTargetMode: z.enum(["whole_sentence", "word_at_offset"]).optional(),
    isPaused: z.boolean(),
    noteMode: z.boolean()
  })
});

export type LlmCommandRequest = z.infer<typeof llmCommandRequestSchema>;

export const llmStudyRequestSchema = z.object({
  provider: llmProviderSchema,
  apiKey: z.string().min(1),
  model: z.string().min(1),
  baseUrl: z.string().url().optional(),
  targetLanguage: z.string().min(1),
  intent: z.enum(["translate", "explain", "spell", "examples"]),
  target: commandTargetSchema,
  sentence: z.string().min(1),
  context: z.string().optional()
});

export type LlmStudyRequest = z.infer<typeof llmStudyRequestSchema>;

const snakeAlignmentSchema = z.object({
  characters: z.array(z.string()),
  character_start_times_seconds: z.array(z.number()),
  character_end_times_seconds: z.array(z.number())
});

export const elevenLabsTimestampResponseSchema = z.object({
  audio_base64: z.string().min(1),
  alignment: snakeAlignmentSchema.optional(),
  normalized_alignment: snakeAlignmentSchema.optional()
});

export type SnakeElevenLabsAlignment = z.infer<typeof snakeAlignmentSchema>;

