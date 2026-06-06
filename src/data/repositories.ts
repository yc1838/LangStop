import type {
  BookmarkRecord,
  FlashcardRecord,
  LangStopDb,
  NoteRecord,
  ReaderDocument,
  ReadingPosition,
  ReviewLogRecord,
  StudyEventRecord
} from "./db";

export interface DocumentStateInput {
  document: ReaderDocument;
  position?: ReadingPosition;
}

export interface RestoredDocumentState {
  document: ReaderDocument;
  position?: ReadingPosition;
  bookmarks: BookmarkRecord[];
  notes: NoteRecord[];
  studyEvents: StudyEventRecord[];
  flashcards: FlashcardRecord[];
  reviewLogs: ReviewLogRecord[];
}

export async function saveDocumentState(
  db: LangStopDb,
  state: DocumentStateInput
): Promise<void> {
  await db.transaction("rw", db.documents, db.positions, async () => {
    await db.documents.put(state.document);
    if (state.position) {
      await db.positions.put(state.position);
    }
  });
}

export async function getDocumentState(
  db: LangStopDb,
  documentId: string
): Promise<RestoredDocumentState | null> {
  const document = await db.documents.get(documentId);
  if (!document) {
    return null;
  }

  const [position, bookmarks, notes, studyEvents, flashcards] = await Promise.all([
    db.positions.get(documentId),
    db.bookmarks.where("documentId").equals(documentId).sortBy("createdAt"),
    db.notes.where("documentId").equals(documentId).sortBy("createdAt"),
    db.studyEvents.where("documentId").equals(documentId).sortBy("createdAt"),
    db.flashcards.where("documentId").equals(documentId).sortBy("createdAt")
  ]);

  const cardIds = new Set(flashcards.map((card) => card.id));
  const reviewLogs = (await db.reviewLogs.toArray())
    .filter((log) => cardIds.has(log.cardId))
    .sort((a, b) => a.reviewedAt.localeCompare(b.reviewedAt));

  return {
    document,
    position,
    bookmarks,
    notes,
    studyEvents,
    flashcards,
    reviewLogs
  };
}

export async function saveBookmark(db: LangStopDb, bookmark: BookmarkRecord): Promise<void> {
  await db.bookmarks.put(bookmark);
}

export async function saveNote(db: LangStopDb, note: NoteRecord): Promise<void> {
  await db.notes.put(note);
}

export async function saveStudyEvent(db: LangStopDb, event: StudyEventRecord): Promise<void> {
  await db.studyEvents.put(event);
}

export async function saveFlashcard(db: LangStopDb, card: FlashcardRecord): Promise<void> {
  await db.flashcards.put(card);
}

export async function saveReviewLog(db: LangStopDb, reviewLog: ReviewLogRecord): Promise<void> {
  await db.reviewLogs.put(reviewLog);
}

export async function getDueFlashcards(
  db: LangStopDb,
  dueAtOrBefore: string
): Promise<FlashcardRecord[]> {
  return db.flashcards
    .where("dueAt")
    .belowOrEqual(dueAtOrBefore)
    .filter((card) => card.status === "active")
    .sortBy("dueAt");
}

