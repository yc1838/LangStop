import { describe, expect, it } from "vitest";
import { prepareTextImport } from "@/reader";

describe("reader import", () => {
  it("creates a document and sentence list from plain text", () => {
    const imported = prepareTextImport({
      id: "doc-demo",
      title: "Demo Text",
      text: "Longtemps. Je voulais dormir.",
      now: "2026-06-06T12:00:00.000Z"
    });

    expect(imported.document).toEqual({
      id: "doc-demo",
      title: "Demo Text",
      sourceType: "text",
      text: "Longtemps. Je voulais dormir.",
      createdAt: "2026-06-06T12:00:00.000Z",
      updatedAt: "2026-06-06T12:00:00.000Z"
    });
    expect(imported.sentences.map((sentence) => sentence.text)).toEqual([
      "Longtemps.",
      "Je voulais dormir."
    ]);
    expect(imported.position).toEqual({
      documentId: "doc-demo",
      currentSentenceIndex: 0,
      updatedAt: "2026-06-06T12:00:00.000Z"
    });
  });
});

