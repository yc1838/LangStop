import { describe, expect, it } from "vitest";
import { getCommandHints } from "@/domain/hints";

describe("command hints", () => {
  it("returns playback hints with word commands when timing is available", () => {
    expect(getCommandHints({ playback: "playing", hasTiming: true }).map((hint) => hint.command)).toEqual([
      "translate",
      "this word",
      "last word",
      "2 words ago",
      "bookmark",
      "notes begin"
    ]);
  });

  it("omits word commands during playback when timing is unavailable", () => {
    expect(getCommandHints({ playback: "playing", hasTiming: false }).map((hint) => hint.command)).toEqual([
      "translate",
      "bookmark",
      "notes begin"
    ]);
  });

  it("returns paused refinement hints", () => {
    expect(getCommandHints({ playback: "paused", hasTiming: true }).map((hint) => hint.command)).toEqual([
      "this word",
      "last word",
      "next word",
      "whole sentence",
      "explain",
      "resume"
    ]);
  });
});

