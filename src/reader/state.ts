import type { ReadingPosition } from "@/data";
import type { ReaderSentence } from "@/domain";

export interface ReaderState {
  documentId: string;
  sentences: ReaderSentence[];
  currentSentenceIndex: number;
}

export function createReaderState(input: {
  documentId: string;
  sentences: ReaderSentence[];
  currentSentenceIndex?: number;
}): ReaderState {
  return {
    documentId: input.documentId,
    sentences: input.sentences,
    currentSentenceIndex: clampIndex(input.currentSentenceIndex ?? 0, input.sentences)
  };
}

function clampIndex(index: number, sentences: ReaderSentence[]): number {
  if (sentences.length === 0) {
    return 0;
  }

  return Math.max(0, Math.min(sentences.length - 1, index));
}

export function getCurrentSentence(state: ReaderState): ReaderSentence | null {
  return state.sentences[state.currentSentenceIndex] ?? null;
}

export function moveReaderPosition(
  state: ReaderState,
  direction: "previous" | "next"
): ReaderState {
  const delta = direction === "next" ? 1 : -1;

  return {
    ...state,
    currentSentenceIndex: clampIndex(state.currentSentenceIndex + delta, state.sentences)
  };
}

export function toReadingPosition(state: ReaderState, updatedAt: string): ReadingPosition {
  return {
    documentId: state.documentId,
    currentSentenceIndex: state.currentSentenceIndex,
    updatedAt
  };
}

