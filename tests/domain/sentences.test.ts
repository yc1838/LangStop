import { describe, expect, it } from "vitest";
import { normalizeReaderText, segmentSentences } from "@/domain/sentences";

describe("sentence domain", () => {
  it("normalizes reader text without losing sentence boundaries", () => {
    expect(normalizeReaderText(" First line.\n\nSecond\t line! ")).toBe(
      "First line. Second line!"
    );
  });

  it("segments normalized text into stable sentence records with offsets", () => {
    const sentences = segmentSentences("Bonjour. Comment allez-vous? Très bien!");

    expect(sentences).toEqual([
      { id: "s1", index: 0, text: "Bonjour.", startOffset: 0, endOffset: 8 },
      {
        id: "s2",
        index: 1,
        text: "Comment allez-vous?",
        startOffset: 9,
        endOffset: 28
      },
      { id: "s3", index: 2, text: "Très bien!", startOffset: 29, endOffset: 39 }
    ]);
  });
});

