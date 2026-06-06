# Phase 1 Domain Foundation Design

## Scope

Phase 1 establishes a runnable Next.js foundation and pure TypeScript domain modules for LangStop. It intentionally excludes provider calls, IndexedDB, document import, playback, voice capture, and UI migration from the static Quiet Library prototype.

## Architecture

The app is a Next.js App Router project with TypeScript, Tailwind, ESLint, and Vitest. Production domain logic lives under `src/domain` and must be framework-agnostic so later UI, API routes, and persistence code can consume it without coupling.

The static prototype files at the repo root remain a visual reference for later phases. The Phase 1 app shell only proves the scaffold runs.

## Domain Modules

- `sentences`: normalizes reader text and segments it into sentence records with stable ids and character offsets.
- `commands`: defines command actions, targets, parser-response validation, and low-confidence rejection.
- `study`: validates LLM study responses and turns returned terms/cards into local flashcard drafts.
- `timing`: validates ElevenLabs character alignment, creates token timelines, resolves interruption tokens, and applies relative offsets.
- `hints`: returns context-aware command hint chips for playback and paused study states.

## Behavior

Sentence segmentation should preserve useful offsets into the normalized text and handle common punctuation. Timed selection supports only `whole_sentence` and `word_at_offset`, including offsets `0`, negative offsets, and paused `next word` from the current selection. If alignment is missing or unusable, callers can detect that no token timeline exists and fall back to whole-sentence behavior.

Command validation accepts only documented actions. Target-specific actions require a target. Responses below `0.6` confidence become `unknown`. Study response validation accepts translation/explanation payloads with target terms and optional flashcards. Flashcard creation prefers explicit provider cards and falls back to cards generated from target terms.

## Testing

Vitest unit tests cover every module before implementation. The phase is complete when `npm test` and `npm run lint` pass.

