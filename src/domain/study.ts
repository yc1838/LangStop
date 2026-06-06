import { z } from "zod";

const targetTermSchema = z.object({
  term: z.string().min(1),
  meaning: z.string().min(1),
  pronunciation: z.string().optional(),
  example: z.string().optional()
});

const flashcardSchema = z.object({
  front: z.string().min(1),
  back: z.string().min(1),
  sourceTerm: z.string().min(1)
});

const studyResponseSchema = z.object({
  type: z.enum(["translation", "explanation"]),
  translation: z.string().optional(),
  explanation: z.string().optional(),
  targetTerms: z.array(targetTermSchema).default([]),
  flashcards: z.array(flashcardSchema).default([])
});

export type StudyResponse = z.infer<typeof studyResponseSchema>;

export interface FlashcardDraft {
  front: string;
  back: string;
  sourceTerm: string;
  status: "draft";
}

export function parseStudyResponse(input: unknown): StudyResponse {
  return studyResponseSchema.parse(input);
}

export function createFlashcardDrafts(input: StudyResponse): FlashcardDraft[] {
  const response = parseStudyResponse(input);

  if (response.flashcards.length > 0) {
    return response.flashcards.map((card) => ({
      ...card,
      status: "draft"
    }));
  }

  return response.targetTerms.map((term) => ({
    front: term.term,
    back: [
      term.meaning,
      term.pronunciation ? `Pronunciation: ${term.pronunciation}` : null,
      term.example ? `Example: ${term.example}` : null
    ]
      .filter(Boolean)
      .join("\n"),
    sourceTerm: term.term,
    status: "draft"
  }));
}
