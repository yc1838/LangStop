import { describe, expect, it } from "vitest";
import { normalizeCommandResponse } from "@/domain/commands";

describe("command domain", () => {
  it("keeps confident target-specific commands with targets", () => {
    const command = normalizeCommandResponse({
      action: "translate",
      target: { mode: "word_at_offset", offset: -1, text: "sommeil" },
      confidence: 0.82
    });

    expect(command).toEqual({
      action: "translate",
      target: { mode: "word_at_offset", offset: -1, text: "sommeil" },
      confidence: 0.82
    });
  });

  it("rejects low-confidence responses as unknown", () => {
    expect(
      normalizeCommandResponse({
        action: "translate",
        target: { mode: "whole_sentence" },
        confidence: 0.59
      })
    ).toEqual({ action: "unknown", confidence: 0.59 });
  });

  it("rejects target-specific actions without a target", () => {
    expect(
      normalizeCommandResponse({
        action: "explain",
        confidence: 0.95
      })
    ).toEqual({ action: "unknown", confidence: 0.95 });
  });
});

