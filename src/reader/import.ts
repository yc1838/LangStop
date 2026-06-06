import type { ReaderDocument, ReadingPosition } from "@/data";
import { normalizeReaderText, segmentSentences, type ReaderSentence } from "@/domain";

export interface TextImportInput {
  id: string;
  title: string;
  text: string;
  now: string;
}

export interface PreparedTextImport {
  document: ReaderDocument;
  sentences: ReaderSentence[];
  position: ReadingPosition;
}

export function prepareTextImport(input: TextImportInput): PreparedTextImport {
  const text = normalizeReaderText(input.text);

  return {
    document: {
      id: input.id,
      title: input.title,
      sourceType: "text",
      text,
      createdAt: input.now,
      updatedAt: input.now
    },
    sentences: segmentSentences(text),
    position: {
      documentId: input.id,
      currentSentenceIndex: 0,
      updatedAt: input.now
    }
  };
}

