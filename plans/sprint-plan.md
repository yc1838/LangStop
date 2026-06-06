# Sprint Plan

## Sprint Goal

Build a demoable LangStop MVP capture loop: import a document, read aloud, interrupt by voice or manual control, translate the whole sentence or selected word, capture notes/bookmarks, and create reviewable flashcards.

## Top Priorities

1. Finish documentation and architecture alignment.
2. Build the smallest verified reader loop.
3. Add study capture only after playback and provider boundaries work.

## In Scope

- Next.js BYOK web app.
- ElevenLabs sentence-level TTS with browser fallback.
- ElevenLabs timestamped TTS for selected-word targeting.
- LLM provider proxy layer.
- PDF/EPUB import.
- Wake phrase command flow.
- Real-time command hint popup after `LangStop`.
- Relative word commands: this word, last word, N words ago, whole sentence.
- Bookmarks, dictated notes, translations, explanations.
- Auto-created context vocab flashcards.
- Simple due review list with FSRS.

## Out Of Scope

- User accounts.
- Cloud sync.
- Native mobile app.
- Full Anki replacement.
- Word-by-word karaoke highlighting.
- Server-side API key storage.

## Current Status

Status: on-track

The project is in documentation and architecture alignment. Implementation has not started.
