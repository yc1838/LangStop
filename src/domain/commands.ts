import { z } from "zod";

export const commandActions = [
  "translate",
  "explain",
  "spell",
  "examples",
  "select_target",
  "bookmark",
  "notes_begin",
  "notes_end",
  "resume",
  "unknown"
] as const;

export type CommandAction = (typeof commandActions)[number];

export type CommandTarget =
  | {
      mode: "whole_sentence";
      text?: string;
    }
  | {
      mode: "word_at_offset";
      offset: number;
      text?: string;
    };

export interface NormalizedCommand {
  action: CommandAction;
  target?: CommandTarget;
  confidence: number;
}

const targetSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("whole_sentence"),
    text: z.string().optional()
  }),
  z.object({
    mode: z.literal("word_at_offset"),
    offset: z.number().int(),
    text: z.string().optional()
  })
]);

const commandSchema = z.object({
  action: z.enum(commandActions),
  target: targetSchema.optional(),
  confidence: z.number().min(0).max(1).catch(0)
});

const targetSpecificActions = new Set<CommandAction>([
  "translate",
  "explain",
  "spell",
  "examples",
  "select_target"
]);

export function normalizeCommandResponse(input: unknown): NormalizedCommand {
  const parsed = commandSchema.safeParse(input);
  if (!parsed.success) {
    return { action: "unknown", confidence: 0 };
  }

  const command = parsed.data;
  if (
    command.confidence < 0.6 ||
    (targetSpecificActions.has(command.action) && !command.target)
  ) {
    return { action: "unknown", confidence: command.confidence };
  }

  return command;
}

