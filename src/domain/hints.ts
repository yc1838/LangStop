export type PlaybackContext = "playing" | "paused";

export interface CommandHintState {
  playback: PlaybackContext;
  hasTiming: boolean;
}

export interface CommandHint {
  command: string;
  targetMode?: "whole_sentence" | "word_at_offset";
}

export function getCommandHints(state: CommandHintState): CommandHint[] {
  if (state.playback === "paused") {
    return [
      { command: "this word", targetMode: "word_at_offset" },
      { command: "last word", targetMode: "word_at_offset" },
      { command: "next word", targetMode: "word_at_offset" },
      { command: "whole sentence", targetMode: "whole_sentence" },
      { command: "explain" },
      { command: "resume" }
    ];
  }

  const hints: CommandHint[] = [{ command: "translate", targetMode: "whole_sentence" }];

  if (state.hasTiming) {
    hints.push(
      { command: "this word", targetMode: "word_at_offset" },
      { command: "last word", targetMode: "word_at_offset" },
      { command: "2 words ago", targetMode: "word_at_offset" }
    );
  }

  hints.push({ command: "bookmark" }, { command: "notes begin" });
  return hints;
}

