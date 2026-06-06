# LangStop Product Requirements

## Summary

LangStop is a voice-first reading and study capture app for language learners. Users import PDFs or EPUBs, listen to sentence-by-sentence narration, interrupt the reader by voice, translate or ask deeper language questions, bookmark passages, dictate notes, and generate flashcards from meaningful language moments.

## Target User

The primary user is a language learner reading long-form material above their current comfort level. They want to stay immersed in the document without constantly switching to dictionaries, translators, and flashcard tools.

## MVP Goals

- Read imported PDF and EPUB documents aloud sentence by sentence.
- Let users interrupt with a wake phrase and natural command.
- Translate either the current sentence or a timestamp-selected word into the user-selected native language.
- Let users refine the word target with relative commands such as `last word` and `4 words ago`.
- Show real-time command hints after the wake phrase so users know what they can say next.
- Support follow-up study actions while playback is paused.
- Capture bookmarks and dictated notes.
- Auto-create flashcards from translated or explained terms.
- Store all reading and study data locally.

## Non-Goals For MVP

- User accounts.
- Cloud sync.
- Collaborative study.
- Full Anki import/export.
- Word-by-word karaoke highlighting.
- Server-side key vault.
- Mobile native app.

## Settings And Key Handling

- Non-secret preferences such as provider choice, native language, voice, and reading settings can persist locally.
- API keys are session-only by default.
- The setup sheet may offer `Remember keys on this device` as an explicit opt-in for durable browser storage.
- Settings must include a clear `Clear keys` action.

## Functional Requirements

### Interface And Experience

- The visual direction is Quiet Library: ink, ivory, sage, and copper.
- The main screen prioritizes an immersive document page, not a dashboard or landing page.
- Desktop layout uses margin annotations and a collapsible Study Tray.
- Mobile layout uses inline annotations and a bottom drawer for study artifacts.
- The first-run setup sheet collects BYOK provider settings before reading.
- The command hint popup appears after `LangStop` and mirrors available voice actions as clickable chips.

### Document Reading

- User can import a PDF or EPUB.
- App extracts readable text and segments it into sentences.
- App tracks current sentence and reading progress.
- Current sentence is highlighted while reading.

### Text-To-Speech

- User pastes an ElevenLabs API key.
- App sends sentence-level TTS requests through a Next.js API route.
- App should use ElevenLabs timestamp-capable TTS for precise word selection when the user's key and quota allow it.
- App uses `eleven_flash_v2_5` by default.
- Browser TTS is used when ElevenLabs fails, quota is exceeded, or no key is provided.
- When timestamp alignment is unavailable, word-target commands fall back to whole-sentence translation with a visible UI hint.
- The implementation must include a manual smoke test for the default ElevenLabs model before timestamped word selection is considered available.

### Voice Commands

- App listens for commands that begin with the wake phrase `LangStop`.
- Voice commands are parsed into normalized actions.
- After the wake phrase is heard, the UI shows a small command hint popup with context-aware next commands.
- Supported translation target commands include `translate`, `translate this word`, `translate last word`, and `translate N words ago`.
- While paused after a translation, supported refinement commands include `this word`, `last word`, `next word`, `N words ago`, `whole sentence`, and `resume`.
- Paused refinement commands are parsed as target selection updates and reuse the current study intent.
- Manual controls exist for all voice actions.
- Voice command support is treated as progressive enhancement because browser speech recognition support varies.

### Translation And Deep Dive

- User can say or click translate for the current sentence.
- User can target the currently aligned word, previous word, next word, or a word N positions before the interruption point.
- Playback pauses while translation is shown.
- The translation annotation identifies whether the target is `whole_sentence` or `word_at_offset`.
- User can ask follow-up questions before resuming, including meaning, spelling, examples, and deeper explanation.
- LLM provider options include DeepSeek, Kimi/Moonshot, OpenAI, Claude, Gemini, and custom OpenAI-compatible.

### Study Capture

- User can bookmark the current sentence.
- User can say `notes begin`, dictate a note, and say `notes end` to save it.
- Notes and bookmarks are linked to the document and sentence.
- Translated or explained terms can become flashcards automatically.
- User can undo newly created flashcards from the Study Tray.

### Review

- App shows a simple due review list.
- Flashcard scheduling uses FSRS through `ts-fsrs` in the browser.
- MVP review UI supports basic ratings: Again, Hard, Good, Easy.

## Success Criteria

- A user can complete this demo path without leaving the app:
  1. Paste keys.
  2. Import a document.
  3. Start narration.
  4. Say `LangStop translate`.
  5. Say `last word` or tap `This Word` in the popup to refine the target.
  6. Ask one follow-up question.
  7. Save a note.
  8. See an auto-created flashcard.
  9. Review one due card.

## Risks

- Browser speech recognition is inconsistent across browsers.
- Speech-start detection has latency, so word selection needs a configurable backtrack offset and clear manual correction controls.
- Word segmentation differs across languages; non-space-separated languages require `Intl.Segmenter` or phrase fallback.
- Provider APIs differ in structured-output support.
- PDF and EPUB parsing can be noisy.
- BYOK is convenient for hackathons but still requires careful UI messaging around key handling.
- Too much SRS functionality could distract from the reader demo.
