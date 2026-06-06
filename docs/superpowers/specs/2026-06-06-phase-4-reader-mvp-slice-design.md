# Phase 4 Reader MVP Slice Design

## Scope

This slice starts Phase 4 with the smallest end-to-end reader loop: import plain text, segment it into sentences, show the current sentence, navigate previous/next, and play the current sentence through a playback service. ElevenLabs failures fall back to browser TTS. Timestamp responses build token timelines when usable.

PDF and EPUB import are not completed in this slice. The import module exposes a source-type boundary so PDF/EPUB extraction can be added behind tests next without changing reader state or UI code.

## Architecture

- `src/reader/import.ts`: prepares imported text documents and sentence lists.
- `src/reader/state.ts`: pure reader state transitions for import, previous, next, and position snapshots.
- `src/reader/playback.ts`: playback orchestration with ElevenLabs audio, timestamp timelines, and browser TTS fallback.
- `src/components/ReaderApp.tsx`: client UI using the Quiet Library design direction.

The UI uses existing domain, data, and provider route boundaries. It does not call real providers unless the user supplies an ElevenLabs key.

## Testing

Vitest covers import preparation, sentence navigation, position snapshots, fallback playback, and timestamp timeline creation. Browser verification checks the rendered reader UI after implementation.

