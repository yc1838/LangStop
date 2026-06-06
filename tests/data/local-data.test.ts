import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import {
  createLangStopDb,
  deleteLangStopDb,
  getDocumentState,
  getDueFlashcards,
  saveBookmark,
  saveDocumentState,
  saveFlashcard,
  saveNote,
  saveReviewLog,
  saveStudyEvent
} from "@/data";

describe("local data layer", () => {
  const dbName = "langstop-test-data";

  afterEach(async () => {
    await deleteLangStopDb(dbName);
  });

  it("saves and restores imported document state with reading position", async () => {
    const db = createLangStopDb(dbName);

    await saveDocumentState(db, {
      document: {
        id: "doc-proust",
        title: "Du côté de chez Swann",
        sourceType: "text",
        text: "Longtemps. Je voulais dormir.",
        createdAt: "2026-06-06T12:00:00.000Z",
        updatedAt: "2026-06-06T12:00:00.000Z"
      },
      position: {
        documentId: "doc-proust",
        currentSentenceIndex: 1,
        updatedAt: "2026-06-06T12:05:00.000Z"
      }
    });

    await db.close();
    const reopened = createLangStopDb(dbName);
    const restored = await getDocumentState(reopened, "doc-proust");

    expect(restored).toEqual({
      document: {
        id: "doc-proust",
        title: "Du côté de chez Swann",
        sourceType: "text",
        text: "Longtemps. Je voulais dormir.",
        createdAt: "2026-06-06T12:00:00.000Z",
        updatedAt: "2026-06-06T12:00:00.000Z"
      },
      position: {
        documentId: "doc-proust",
        currentSentenceIndex: 1,
        updatedAt: "2026-06-06T12:05:00.000Z"
      },
      bookmarks: [],
      notes: [],
      studyEvents: [],
      flashcards: [],
      reviewLogs: []
    });
    reopened.close();
  });

  it("persists bookmarks, notes, study events, flashcards, and review logs", async () => {
    const db = createLangStopDb(dbName);

    await saveDocumentState(db, {
      document: {
        id: "doc-proust",
        title: "Proust",
        sourceType: "text",
        text: "Longtemps.",
        createdAt: "2026-06-06T12:00:00.000Z",
        updatedAt: "2026-06-06T12:00:00.000Z"
      }
    });
    await saveBookmark(db, {
      id: "bookmark-1",
      documentId: "doc-proust",
      sentenceId: "s1",
      sentenceIndex: 0,
      text: "Longtemps.",
      createdAt: "2026-06-06T12:01:00.000Z"
    });
    await saveNote(db, {
      id: "note-1",
      documentId: "doc-proust",
      sentenceId: "s1",
      sentenceIndex: 0,
      content: "Opening rhythm note.",
      createdAt: "2026-06-06T12:02:00.000Z"
    });
    await saveStudyEvent(db, {
      id: "study-1",
      documentId: "doc-proust",
      sentenceId: "s1",
      sentenceIndex: 0,
      type: "translation",
      target: { mode: "whole_sentence" },
      result: "For a long time.",
      provider: "deepseek",
      createdAt: "2026-06-06T12:03:00.000Z"
    });
    await saveFlashcard(db, {
      id: "card-1",
      documentId: "doc-proust",
      studyEventId: "study-1",
      front: "Longtemps",
      back: "For a long time",
      sourceTerm: "Longtemps",
      dueAt: "2026-06-06T12:04:00.000Z",
      createdAt: "2026-06-06T12:03:30.000Z",
      status: "active"
    });
    await saveReviewLog(db, {
      id: "review-1",
      cardId: "card-1",
      rating: "good",
      reviewedAt: "2026-06-06T12:05:00.000Z",
      nextDueAt: "2026-06-07T12:05:00.000Z"
    });

    const restored = await getDocumentState(db, "doc-proust");
    const dueCards = await getDueFlashcards(db, "2026-06-06T12:04:00.000Z");

    expect(restored.bookmarks).toHaveLength(1);
    expect(restored.notes).toHaveLength(1);
    expect(restored.studyEvents).toHaveLength(1);
    expect(restored.flashcards).toHaveLength(1);
    expect(restored.reviewLogs).toHaveLength(1);
    expect(dueCards.map((card) => card.id)).toEqual(["card-1"]);
    db.close();
  });
});
