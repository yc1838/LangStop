import { describe, expect, it } from "vitest";
import { createFlashcardDrafts, parseStudyResponse } from "@/domain/study";

describe("study domain", () => {
  it("validates study responses with target terms and flashcards", () => {
    const parsed = parseStudyResponse({
      type: "translation",
      translation: "sleep",
      targetTerms: [
        {
          term: "le sommeil",
          meaning: "sleep",
          pronunciation: "luh soh-may",
          example: "Le sommeil est profond."
        }
      ],
      flashcards: [
        {
          front: "le sommeil",
          back: "sleep",
          sourceTerm: "le sommeil"
        }
      ]
    });

    expect(parsed.type).toBe("translation");
    expect(parsed.targetTerms).toHaveLength(1);
  });

  it("creates flashcard drafts from explicit cards before generated term cards", () => {
    const drafts = createFlashcardDrafts({
      type: "translation",
      targetTerms: [
        {
          term: "la bougie",
          meaning: "candle",
          pronunciation: "boo-zhee",
          example: "La bougie est éteinte."
        }
      ],
      flashcards: [
        {
          front: "Longtemps ... la bougie ...",
          back: "candle",
          sourceTerm: "la bougie"
        }
      ]
    });

    expect(drafts).toEqual([
      {
        front: "Longtemps ... la bougie ...",
        back: "candle",
        sourceTerm: "la bougie",
        status: "draft"
      }
    ]);
  });

  it("generates flashcard drafts from target terms when no explicit cards exist", () => {
    const drafts = createFlashcardDrafts({
      type: "explanation",
      explanation: "A common noun for candle.",
      targetTerms: [
        {
          term: "la bougie",
          meaning: "candle",
          pronunciation: "boo-zhee",
          example: "La bougie est éteinte."
        }
      ]
    });

    expect(drafts).toEqual([
      {
        front: "la bougie",
        back: "candle\nPronunciation: boo-zhee\nExample: La bougie est éteinte.",
        sourceTerm: "la bougie",
        status: "draft"
      }
    ]);
  });
});

