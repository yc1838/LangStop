# LangStop

LangStop is a voice-first language reading app for PDFs and EPUBs. It reads documents aloud, lets the reader interrupt by voice, translates or explains the current sentence, captures bookmarks and dictated notes, and turns useful language moments into flashcards for later review.

This repository is intentionally starting with documentation before implementation. The first build should follow the docs in this order:

1. [Product Requirements](docs/product-requirements.md)
2. [Architecture](docs/architecture.md)
3. [Interaction Workflows](docs/interaction-workflows.md)
4. [Timed Word Selection](docs/timed-word-selection.md)
5. [Quiet Library Interface](docs/interface-quiet-library.md)
6. [Implementation Phases](docs/implementation-phases.md)
7. [Software Development Process](docs/software-development-process.md)

## MVP Positioning

LangStop is not trying to be a complete Anki replacement in the hackathon MVP. The goal is a polished capture loop:

- Import a document.
- Listen sentence by sentence.
- Interrupt with voice.
- Translate the whole sentence or the precisely selected word.
- Navigate around the interruption point with commands such as "last word" or "4 words ago."
- See a live command hint popup after saying the wake phrase.
- Save bookmarks and notes.
- Automatically create reviewable flashcards.

## Core Constraints

- BYOK: users paste their own ElevenLabs and LLM keys.
- No auth, cloud sync, or server-side key storage in the MVP.
- API keys are session-only by default, with explicit local remember opt-in.
- Next.js API routes proxy provider calls to reduce browser CORS issues and keep provider differences out of the UI.
- IndexedDB stores local documents, reading state, notes, bookmarks, study events, flashcards, and review logs.
- Manual UI controls must exist for every voice action.
- Timed word selection uses ElevenLabs timestamp alignment when available and falls back to whole-sentence translation when timing is unavailable.
- FSRS scheduling runs client-side in the browser for the MVP.
- The visual direction is Quiet Library: ink, ivory, sage, copper, centered reading surface, margin annotations, and calm command controls.
