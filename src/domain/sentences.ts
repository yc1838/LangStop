export interface ReaderSentence {
  id: string;
  index: number;
  text: string;
  startOffset: number;
  endOffset: number;
}

export function normalizeReaderText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function segmentSentences(text: string): ReaderSentence[] {
  const normalized = normalizeReaderText(text);
  const matches = normalized.matchAll(/[^.!?]+[.!?]+(?:["'”’])?|[^.!?]+$/g);

  return Array.from(matches)
    .map((match, index) => {
      const rawText = match[0];
      const leadingWhitespace = rawText.match(/^\s*/)?.[0].length ?? 0;
      const sentenceText = rawText.trim();
      const startOffset = (match.index ?? 0) + leadingWhitespace;

      return {
        id: `s${index + 1}`,
        index,
        text: sentenceText,
        startOffset,
        endOffset: startOffset + sentenceText.length
      };
    })
    .filter((sentence) => sentence.text.length > 0);
}

