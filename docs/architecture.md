# LangStop Architecture

## Architecture Summary

LangStop should be a Next.js App Router application with a client-heavy reader and thin API routes for provider calls. The browser owns documents, playback state, local study data, settings, and user-pasted keys. Keys are session-only by default unless the user explicitly opts into durable local storage. API routes proxy ElevenLabs and LLM calls per request, normalize provider behavior, and return simple response shapes to the UI.

## System Context

```mermaid
flowchart TB
    User["Reader / Language Learner"]
    Browser["LangStop Web App\nNext.js Client"]
    Api["Next.js API Routes\nProvider Proxy"]
    Eleven["ElevenLabs TTS API"]
    LLM["LLM Providers\nDeepSeek, Kimi, OpenAI, Claude, Gemini, Custom"]
    IDB["IndexedDB\nDocuments + Study Data"]
    Speech["Browser Speech Recognition"]
    Audio["Web Audio + SpeechSynthesis Fallback"]

    User --> Browser
    Browser <--> IDB
    Browser <--> Speech
    Browser <--> Audio
    Browser --> Api
    Api --> Eleven
    Api --> LLM
```

## Boundary Decisions

- **Client owns product state:** current document, current sentence, playback state, voice state, study tray state, settings, and local records.
- **Settings persistence is split by sensitivity:** non-secret preferences can persist locally, while API keys use session-only storage by default and move to durable browser storage only after explicit "remember keys on this device" opt-in.
- **API routes own provider calls:** ElevenLabs TTS, command interpretation, translation, explanation, flashcard generation.
- **IndexedDB owns persistence:** documents, reading positions, bookmarks, notes, study events, flashcards, and review logs.
- **No server persistence:** API keys and user content are not written server-side.
- **Review scheduling is client-side:** `ts-fsrs` runs in the browser and writes card state plus `ReviewLog` records to IndexedDB. The MVP does not need review API routes.

## Proposed Subsystems

### Reader Domain

Responsibilities:

- Parse imported documents.
- Normalize extracted text.
- Segment text into sentences.
- Track current sentence and progress.

### Playback Domain

Responsibilities:

- Request ElevenLabs audio for the active sentence.
- Request timestamp alignment when available.
- Prefetch upcoming sentence audio.
- Track sentence audio start time through Web Audio.
- Resolve interruption time to a word token using a latency backtrack offset.
- Fall back to browser TTS.
- Pause and resume around study interactions.

### Timed Word Selection Domain

Responsibilities:

- Convert ElevenLabs character alignment into token timing.
- Support target modes `whole_sentence` and `word_at_offset`.
- Resolve offsets such as `0`, `-1`, `-2`, and `-4` relative to the interruption token, plus `+1` from an existing paused word selection.
- Clamp relative offsets to valid token boundaries.
- Fall back to `whole_sentence` when timestamp alignment is unavailable.

### Voice Domain

Responsibilities:

- Listen for wake phrase.
- Show a context-aware command hint popup after the wake phrase.
- Capture command transcript.
- Capture dictated notes between note begin and note end.
- Dispatch normalized actions.
- Route paused refinement commands such as `last word`, `next word`, and `whole sentence`.

### Study Domain

Responsibilities:

- Store bookmarks, notes, translations, and explanations.
- Generate flashcards from LLM responses.
- Schedule and review cards in the browser using FSRS.

### Provider Domain

Responsibilities:

- Hide LLM provider differences.
- Use strict JSON prompts and schema validation.
- Support DeepSeek, Kimi/Moonshot, OpenAI, Anthropic, Google, and custom OpenAI-compatible endpoints.

## API Shape

### `POST /api/elevenlabs/tts`

Request:

```json
{
  "apiKey": "user pasted key",
  "text": "Sentence to read aloud.",
  "voiceId": "JBFqnCBsd6RMkjVDRZzb",
  "modelId": "eleven_flash_v2_5"
}
```

Response:

- `audio/mpeg`

### `POST /api/elevenlabs/tts-with-timestamps`

Request:

```json
{
  "apiKey": "user pasted key",
  "text": "Sentence to read aloud.",
  "voiceId": "JBFqnCBsd6RMkjVDRZzb",
  "modelId": "eleven_flash_v2_5"
}
```

Response:

```json
{
  "audioBase64": "base64 encoded audio",
  "alignment": {
    "characters": ["S", "e", "n"],
    "characterStartTimesSeconds": [0, 0.08, 0.14],
    "characterEndTimesSeconds": [0.08, 0.14, 0.2]
  },
  "normalizedAlignment": {
    "characters": ["S", "e", "n"],
    "characterStartTimesSeconds": [0, 0.08, 0.14],
    "characterEndTimesSeconds": [0.08, 0.14, 0.2]
  }
}
```

Notes:

- The client should prefer `normalizedAlignment` when present.
- The implementation must include a manual smoke test with the default model and a short sample sentence to confirm that the response includes usable character timing before timed word selection is treated as available.
- If this route fails or returns no usable alignment, playback should fall back to `/api/elevenlabs/tts`, then browser TTS, and word-target commands should degrade to `whole_sentence`.

### `POST /api/llm/command`

Request:

```json
{
  "provider": "deepseek",
  "apiKey": "user pasted key",
  "model": "deepseek-v4-flash",
  "transcript": "LangStop explain this word",
  "readerState": {
    "currentSentence": "The original sentence.",
    "interruptionToken": "original",
    "selectedTargetMode": "word_at_offset",
    "isPaused": true,
    "noteMode": false
  }
}
```

Response:

```json
{
  "action": "explain",
  "target": {
    "mode": "word_at_offset",
    "offset": 0,
    "text": "original"
  },
  "confidence": 0.82
}
```

Response contract:

- `action` is one of `translate`, `explain`, `spell`, `examples`, `select_target`, `bookmark`, `notes_begin`, `notes_end`, `resume`, or `unknown`.
- `select_target` is the normalized action for paused refinement commands such as `this word`, `last word`, `next word`, `N words ago`, and `whole sentence`.
- `target` is optional. It is required for target-specific actions such as `translate`, `explain`, `spell`, `examples`, and `select_target`, and omitted for actions such as `bookmark`, `notes_begin`, `notes_end`, and `resume`.
- `target.mode` is `whole_sentence` or `word_at_offset`. For `word_at_offset`, `target.offset` is relative to the interruption token by default, or to the current selected token when the paused refinement is `next word`.
- `target.text` is optional in the command response because the client may need to resolve the final token from the local timeline before sending `/api/llm/study`.
- `confidence` is a number from `0` to `1`.
- If `confidence` is below `0.6`, or if a target-specific action is missing `target`, the client treats the command as `unknown`, keeps the command popup open, and shows examples instead of executing the action.

### `POST /api/llm/study`

Request:

```json
{
  "provider": "deepseek",
  "apiKey": "user pasted key",
  "model": "deepseek-v4-flash",
  "baseUrl": "optional custom endpoint",
  "targetLanguage": "Chinese",
  "intent": "translate",
  "target": {
    "mode": "word_at_offset",
    "offset": -1,
    "text": "previous"
  },
  "sentence": "The original sentence.",
  "context": "Optional surrounding text."
}
```

Response:

```json
{
  "type": "translation",
  "translation": "Translated sentence.",
  "explanation": "Short explanation if useful.",
  "targetTerms": [
    {
      "term": "word or phrase",
      "meaning": "Native-language meaning",
      "pronunciation": "Simple pronunciation or spelling help",
      "example": "Short example sentence"
    }
  ],
  "flashcards": [
    {
      "front": "Original sentence with target term highlighted.",
      "back": "Meaning, pronunciation, and example.",
      "sourceTerm": "word or phrase"
    }
  ]
}
```

## State Machines

### Playback State

```mermaid
stateDiagram-v2
    [*] --> Empty
    Empty --> Ready: document imported
    Ready --> LoadingAudio: play
    LoadingAudio --> TimedReady: timestamped audio loaded
    TimedReady --> Playing: Web Audio starts
    LoadingAudio --> Playing: untimed ElevenLabs audio loaded
    LoadingAudio --> FallbackTts: ElevenLabs fails
    Playing --> LoadingAudio: sentence ended
    Playing --> StudyPaused: translate / explain / note
    FallbackTts --> Playing: browser TTS speaking
    StudyPaused --> Playing: resume
    StudyPaused --> LoadingAudio: next / previous sentence
    Playing --> Paused: pause
    Paused --> Playing: resume
    Paused --> LoadingAudio: next / previous sentence
    Ready --> Error: parsing failed
    LoadingAudio --> Error: unrecoverable playback error
    Error --> Ready: user recovers
```

### Timed Selection State

```mermaid
stateDiagram-v2
    [*] --> NoTiming
    NoTiming --> TimelineReady: timestamp alignment loaded
    TimelineReady --> PlayingTimed: audio starts
    PlayingTimed --> InterruptResolved: wake phrase or speech start
    InterruptResolved --> WordSelected: target=this word / last word / N words ago
    InterruptResolved --> SentenceSelected: target=whole sentence
    WordSelected --> WordSelected: previous / next / N words ago
    WordSelected --> SentenceSelected: whole sentence
    SentenceSelected --> WordSelected: this word
    WordSelected --> [*]: resume
    SentenceSelected --> [*]: resume
```

### Voice State

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Listening: mic enabled
    Listening --> CommandPending: wake phrase heard
    CommandPending --> HintVisible: show command popup
    HintVisible --> CommandPending: transcript updates
    HintVisible --> Listening: hint timeout / cancel
    CommandPending --> Listening: command handled
    CommandPending --> NoteCapturing: notes begin
    NoteCapturing --> NoteCapturing: append dictated text
    NoteCapturing --> Listening: notes end
    Listening --> Idle: mic disabled
```

## Data Model

Minimum local entities:

- `DocumentRecord`: imported document metadata and extracted sentences.
- `ReadingPosition`: document ID, sentence index, updated time.
- `Bookmark`: document ID, sentence index, sentence text, note, created time.
- `VoiceNote`: document ID, sentence index, dictated content, created time.
- `StudyEvent`: translation or explanation event linked to a sentence.
- `TimedToken`: token text, start time, end time, start char, end char, token index.
- `SelectionTarget`: `whole_sentence` or `word_at_offset`, selected token index, offset, text, timing availability.
- `Flashcard`: front, back, source term, source sentence, FSRS card state, due date.
- `ReviewLog`: flashcard ID, rating, review time, scheduling result.

No review endpoints are planned for the MVP. Review cards, ratings, due dates, and scheduling results stay in IndexedDB unless a future sync feature moves review state server-side.
