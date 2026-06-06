import type { LlmCommandRequest, LlmStudyRequest } from "./schemas";

export function buildCommandPrompts(request: LlmCommandRequest) {
  return {
    systemPrompt:
      "Return only strict JSON for a LangStop voice command. Valid actions are translate, explain, spell, examples, select_target, bookmark, notes_begin, notes_end, resume, and unknown. Include confidence from 0 to 1. Target-specific actions require target.mode whole_sentence or word_at_offset.",
    userPrompt: JSON.stringify({
      transcript: request.transcript,
      readerState: request.readerState
    })
  };
}

export function buildStudyPrompts(request: LlmStudyRequest) {
  return {
    systemPrompt:
      "Return only strict JSON for a LangStop study response. Use type translation or explanation. Include targetTerms as an array and flashcards as an array. Keep explanations concise.",
    userPrompt: JSON.stringify({
      targetLanguage: request.targetLanguage,
      intent: request.intent,
      target: request.target,
      sentence: request.sentence,
      context: request.context
    })
  };
}

