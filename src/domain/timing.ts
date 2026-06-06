export interface CharacterAlignment {
  characters: string[];
  characterStartTimesSeconds: number[];
  characterEndTimesSeconds: number[];
}

export interface TokenTiming {
  index: number;
  text: string;
  startChar: number;
  endChar: number;
  startTimeSeconds: number;
  endTimeSeconds: number;
}

export function normalizeAlignment(input: unknown): CharacterAlignment | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const candidate = input as Partial<CharacterAlignment>;
  const { characters, characterStartTimesSeconds, characterEndTimesSeconds } = candidate;
  if (
    !Array.isArray(characters) ||
    !Array.isArray(characterStartTimesSeconds) ||
    !Array.isArray(characterEndTimesSeconds) ||
    characters.length === 0 ||
    characters.length !== characterStartTimesSeconds.length ||
    characters.length !== characterEndTimesSeconds.length
  ) {
    return null;
  }

  const timingsAreNumbers = [...characterStartTimesSeconds, ...characterEndTimesSeconds].every(
    (value) => typeof value === "number" && Number.isFinite(value)
  );

  return timingsAreNumbers
    ? {
        characters,
        characterStartTimesSeconds,
        characterEndTimesSeconds
      }
    : null;
}

export function buildTokenTimeline(
  text: string,
  alignmentInput: unknown
): TokenTiming[] {
  const alignment = normalizeAlignment(alignmentInput);
  if (!alignment) {
    return [];
  }

  const tokens = Array.from(text.matchAll(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu));

  return tokens
    .map((match, index) => {
      const tokenText = match[0];
      const startChar = match.index ?? 0;
      const endChar = startChar + tokenText.length;
      const firstAlignedChar = Math.min(startChar, alignment.characters.length - 1);
      const lastAlignedChar = Math.min(endChar - 1, alignment.characters.length - 1);

      return {
        index,
        text: tokenText,
        startChar,
        endChar,
        startTimeSeconds: alignment.characterStartTimesSeconds[firstAlignedChar],
        endTimeSeconds: alignment.characterEndTimesSeconds[lastAlignedChar]
      };
    })
    .filter((token) => token.startTimeSeconds <= token.endTimeSeconds);
}

export function resolveTokenAtTime(
  timeline: TokenTiming[],
  spokenTimeSeconds: number
): TokenTiming | null {
  if (timeline.length === 0) {
    return null;
  }

  const containing = timeline.find(
    (token) =>
      spokenTimeSeconds >= token.startTimeSeconds &&
      spokenTimeSeconds <= token.endTimeSeconds
  );
  if (containing) {
    return containing;
  }

  const previous = timeline.filter((token) => token.startTimeSeconds <= spokenTimeSeconds).at(-1);
  return previous ?? timeline[0];
}

export function resolveOffsetToken(
  timeline: TokenTiming[],
  baseIndex: number,
  offset: number
): TokenTiming | null {
  if (timeline.length === 0) {
    return null;
  }

  const targetIndex = Math.max(0, Math.min(timeline.length - 1, baseIndex + offset));
  return timeline[targetIndex];
}

