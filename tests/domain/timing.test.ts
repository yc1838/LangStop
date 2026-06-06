import { describe, expect, it } from "vitest";
import {
  buildTokenTimeline,
  normalizeAlignment,
  resolveOffsetToken,
  resolveTokenAtTime
} from "@/domain/timing";

describe("timing domain", () => {
  const alignment = {
    characters: Array.from("hello world"),
    characterStartTimesSeconds: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.36, 0.42, 0.48, 0.54],
    characterEndTimesSeconds: [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.36, 0.42, 0.48, 0.54, 0.6]
  };

  it("normalizes usable ElevenLabs alignment", () => {
    expect(normalizeAlignment(alignment)).toEqual(alignment);
    expect(normalizeAlignment(undefined)).toBeNull();
  });

  it("builds word token timelines from character alignment", () => {
    expect(buildTokenTimeline("hello world", alignment)).toEqual([
      {
        index: 0,
        text: "hello",
        startChar: 0,
        endChar: 5,
        startTimeSeconds: 0,
        endTimeSeconds: 0.25
      },
      {
        index: 1,
        text: "world",
        startChar: 6,
        endChar: 11,
        startTimeSeconds: 0.3,
        endTimeSeconds: 0.6
      }
    ]);
  });

  it("resolves spoken time to the nearest previous token", () => {
    const timeline = buildTokenTimeline("hello world", alignment);

    expect(resolveTokenAtTime(timeline, 0.44)?.text).toBe("world");
    expect(resolveTokenAtTime(timeline, 99)?.text).toBe("world");
  });

  it("applies relative offsets and clamps to token boundaries", () => {
    const timeline = buildTokenTimeline("hello world", alignment);

    expect(resolveOffsetToken(timeline, 1, -1)?.text).toBe("hello");
    expect(resolveOffsetToken(timeline, 1, 1)?.text).toBe("world");
    expect(resolveOffsetToken(timeline, 0, -4)?.text).toBe("hello");
  });
});

