import { describe, expect, it } from "vitest";
import {
  createReaderState,
  getCurrentSentence,
  moveReaderPosition,
  toReadingPosition
} from "@/reader";

const sentences = [
  { id: "s1", index: 0, text: "One.", startOffset: 0, endOffset: 4 },
  { id: "s2", index: 1, text: "Two.", startOffset: 5, endOffset: 9 }
];

describe("reader state", () => {
  it("tracks the current sentence and clamps navigation", () => {
    const state = createReaderState({ documentId: "doc-1", sentences });

    expect(getCurrentSentence(state)?.text).toBe("One.");
    expect(getCurrentSentence(moveReaderPosition(state, "next"))?.text).toBe("Two.");
    expect(getCurrentSentence(moveReaderPosition(state, "next"))?.text).toBe("Two.");
    expect(getCurrentSentence(moveReaderPosition(state, "previous"))?.text).toBe("One.");
  });

  it("creates a reading position snapshot for persistence", () => {
    const state = moveReaderPosition(createReaderState({ documentId: "doc-1", sentences }), "next");

    expect(toReadingPosition(state, "2026-06-06T12:10:00.000Z")).toEqual({
      documentId: "doc-1",
      currentSentenceIndex: 1,
      updatedAt: "2026-06-06T12:10:00.000Z"
    });
  });
});

