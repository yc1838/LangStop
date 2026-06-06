# Phase 4 Quiet Library UI Alignment Design

## Scope

This Phase 4 continuation aligns the real Next.js reader UI with the referenced Claude design prototype in `design/quiet-library-prototype`. The prototype is the visual source of truth for layout, spacing, typography, colors, controls, Study Tray treatment, command popup presentation, annotations, and setup sheet styling.

The slice preserves the already-tested Phase 4 reader behavior: text import, sentence segmentation, previous/next navigation, play/pause, speed changes, ElevenLabs playback, browser TTS fallback, and local setup/key storage. It does not complete Phase 5 voice recognition, LLM study actions, real bookmark/note capture, flashcard scheduling, PDF extraction, or EPUB extraction.

## Architecture

- `src/components/ReaderApp.tsx` remains the client entry for the reader experience.
- `src/app/globals.css` carries the productionized Quiet Library styles adapted from `design/quiet-library-prototype/styles.css`.
- Existing pure modules under `src/reader`, `src/data`, `src/setup`, and `src/providers` stay authoritative for behavior.
- Prototype-only demo state may be represented as UI placeholders when the matching Phase 5 or Phase 6 behavior is not implemented yet.

## UI Mapping

- The app shell should match the prototype's `app`, `topbar`, `stage`, centered reader scroll, collapsible tray, command popup, floating playback bar, and setup sheet.
- The reading surface should match the prototype's paper page, paper grain, document header, paragraphs, drop cap, serif body text, active sentence wash, translating edge, and clickable word styling.
- The topbar should match the prototype wordmark, provider/native-language status pill, import control, tray toggle, and settings button.
- The playback bar should match the prototype dark floating control bar with previous, play/pause, next, voice state, speed, microphone, and translate controls.
- The Study Tray should visually match the prototype sections for new flashcards, recent translations, bookmarks, notes, and due review, using placeholder/demo entries only where the product behavior is not yet built.
- The setup sheet should match the prototype's BYOK flow while preserving the existing key lifetime rules.

## Data Flow

Reader actions continue to call the existing state and persistence functions. Visual-only controls that belong to later phases should update local UI placeholder state or remain inert with clear labels, rather than introducing untested provider calls or fake persistence.

## Testing And Verification

Vitest should continue to pass for existing Phase 1-4 behavior. Because this slice is mostly UI alignment, verification should include lint/build plus browser inspection against `design/quiet-library-prototype` on desktop and mobile widths.

## Acceptance Criteria

- The first screen visually reads as the referenced Quiet Library prototype, not the current simplified reader.
- The existing Phase 4 reader flow still works after the UI port.
- The app does not claim Phase 5/6 behavior is complete; later-phase controls are visually present but clearly placeholder or locally simulated.
- Desktop layout includes centered document page, margin annotation area, floating playback bar, and right Study Tray.
- Mobile layout preserves a single-column reading surface with bottom-sheet style playback and tray behavior.
