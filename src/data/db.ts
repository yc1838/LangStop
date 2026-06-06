import Dexie, { type Table } from "dexie";
import type { CommandTarget } from "@/domain";

export type DocumentSourceType = "text" | "pdf" | "epub";

export interface ReaderDocument {
  id: string;
  title: string;
  sourceType: DocumentSourceType;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingPosition {
  documentId: string;
  currentSentenceIndex: number;
  updatedAt: string;
}

export interface BookmarkRecord {
  id: string;
  documentId: string;
  sentenceId: string;
  sentenceIndex: number;
  text: string;
  createdAt: string;
}

export interface NoteRecord {
  id: string;
  documentId: string;
  sentenceId: string;
  sentenceIndex: number;
  content: string;
  createdAt: string;
}

export interface StudyEventRecord {
  id: string;
  documentId: string;
  sentenceId: string;
  sentenceIndex: number;
  type: "translation" | "explanation";
  target: CommandTarget;
  result: string;
  provider: string;
  createdAt: string;
}

export interface FlashcardRecord {
  id: string;
  documentId: string;
  studyEventId?: string;
  front: string;
  back: string;
  sourceTerm: string;
  dueAt: string;
  createdAt: string;
  status: "active" | "suspended";
}

export interface ReviewLogRecord {
  id: string;
  cardId: string;
  rating: "again" | "hard" | "good" | "easy";
  reviewedAt: string;
  nextDueAt: string;
}

export class LangStopDb extends Dexie {
  documents!: Table<ReaderDocument, string>;
  positions!: Table<ReadingPosition, string>;
  bookmarks!: Table<BookmarkRecord, string>;
  notes!: Table<NoteRecord, string>;
  studyEvents!: Table<StudyEventRecord, string>;
  flashcards!: Table<FlashcardRecord, string>;
  reviewLogs!: Table<ReviewLogRecord, string>;

  constructor(name = "langstop") {
    super(name);

    this.version(1).stores({
      documents: "id, updatedAt",
      positions: "documentId, updatedAt",
      bookmarks: "id, documentId, sentenceId, createdAt",
      notes: "id, documentId, sentenceId, createdAt",
      studyEvents: "id, documentId, sentenceId, type, createdAt",
      flashcards: "id, documentId, studyEventId, status, dueAt, sourceTerm",
      reviewLogs: "id, cardId, reviewedAt, nextDueAt"
    });
  }
}

export function createLangStopDb(name?: string): LangStopDb {
  return new LangStopDb(name);
}

export async function deleteLangStopDb(name = "langstop"): Promise<void> {
  await Dexie.delete(name);
}

