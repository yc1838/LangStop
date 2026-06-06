# LangStop Interaction Workflows

This document captures the main workflows LangStop must support. These diagrams should be treated as product and engineering source of truth until implementation begins.

## First-Run Setup

```mermaid
sequenceDiagram
    actor User
    participant UI as LangStop UI
    participant Store as Browser Storage

    User->>UI: Open app
    UI->>Store: Check saved settings
    alt Missing required settings
        UI->>User: Show setup sheet
        User->>UI: Paste ElevenLabs key, LLM key, provider, language
        UI->>Store: Save non-secret settings locally
        UI->>Store: Save API keys to sessionStorage by default
        opt User enables remember keys on this device
            UI->>Store: Save API keys to localStorage
        end
    else Settings exist
        UI->>User: Show reader
    end
```

## Document Import And Sentence Preparation

```mermaid
flowchart TD
    A["User imports PDF or EPUB"] --> B{"File type"}
    B -->|"PDF"| C["Extract text with pdf.js"]
    B -->|"EPUB"| D["Unzip with JSZip"]
    D --> E["Read container.xml and OPF spine"]
    E --> F["Extract XHTML text in reading order"]
    C --> G["Normalize whitespace"]
    F --> G
    G --> H["Segment into sentences"]
    H --> I["Persist document and sentence list in IndexedDB"]
    I --> J["Set reading position to first sentence"]
```

## Sentence Playback

```mermaid
sequenceDiagram
    actor User
    participant UI as Reader UI
    participant Player as Playback Controller
    participant API as /api/elevenlabs/tts-with-timestamps
    participant Eleven as ElevenLabs
    participant Timeline as Token Timeline
    participant BrowserTTS as Browser SpeechSynthesis

    User->>UI: Press play
    UI->>Player: Play current sentence
    Player->>API: Request timestamped audio for sentence
    API->>Eleven: POST TTS with timestamps using user key
    alt Timestamped ElevenLabs succeeds
        Eleven-->>API: audio_base64 + alignment
        API-->>Player: audio + character timing
        Player->>Timeline: Build token timing map
        Player->>UI: Highlight current sentence
        Player->>User: Play audio
    else Timestamped ElevenLabs fails
        API-->>Player: Error
        Player->>BrowserTTS: Speak sentence
        Player->>UI: Show fallback state
    end
    Player->>API: Prefetch next sentence audio
```

## Timed Word Selection

```mermaid
flowchart TD
    A["ElevenLabs character alignment"] --> B["Normalize character arrays and timing arrays"]
    B --> C["Segment original sentence into tokens"]
    C --> D["Map token start/end chars to start/end seconds"]
    D --> E["Audio starts through Web Audio"]
    E --> F["Store sentencePlayStartTime"]
    F --> G["User says wake phrase or starts command"]
    G --> H["Stop or pause playback immediately"]
    H --> I["spokenTime = currentAudioTime - sentencePlayStartTime - latencyOffset"]
    I --> J["Find interruption token index"]
    J --> K{"Command target"}
    K -->|"this word"| L["Select token at index"]
    K -->|"last word"| M["Select token at index - 1"]
    K -->|"N words ago"| N["Select token at index - N"]
    K -->|"whole sentence"| O["Select full sentence"]
    K -->|"next word while paused"| Q["Select prior selected token + 1"]
    L --> P["Clamp target and show annotation"]
    M --> P
    N --> P
    O --> P
    Q --> P
```

## Voice Command Routing

```mermaid
flowchart TD
    A["Mic transcript received"] --> B{"Contains wake phrase LangStop?"}
    B -->|"No"| C["Ignore for commands"]
    B -->|"Yes"| D["Show live command hint popup"]
    D --> E["Collect command transcript"]
    E --> F["Send transcript and reader state to /api/llm/command"]
    F --> G{"Normalized action"}
    G -->|"bookmark"| H["Create bookmark for current sentence"]
    G -->|"notes_begin"| I["Enter note capture mode"]
    G -->|"notes_end"| J["Save dictated note"]
    G -->|"translate whole_sentence"| K["Pause and request sentence translation"]
    G -->|"translate word_at_offset"| L["Resolve selected word and request word translation"]
    G -->|"select_target next word"| P["Resolve selected word + 1 while paused"]
    G -->|"explain / spell / examples"| M["Request deep dive for selected target"]
    G -->|"resume"| N["Resume playback"]
    G -->|"unknown"| O["Keep popup open with examples"]
    P --> L
```

## Command Hint Popup

```mermaid
stateDiagram-v2
    [*] --> Hidden
    Hidden --> ListeningForWake: mic enabled
    ListeningForWake --> Visible: "LangStop" detected
    Visible --> Updating: transcript changes
    Updating --> Visible: recognized partial command
    Visible --> Executing: command accepted
    Visible --> Hidden: timeout / cancel / resume
    Executing --> Hidden: action complete

    note right of Visible
      Popup shows context-aware options:
      translate, this word, last word,
      N words ago, whole sentence, resume.
    end note
```

## Translate And Deep Dive

```mermaid
sequenceDiagram
    actor User
    participant Voice as Voice Controller
    participant Player as Playback
    participant API as /api/llm/study
    participant LLM as Selected LLM Provider
    participant Tray as Study Tray
    participant DB as IndexedDB

    User->>Voice: "LangStop translate"
    Voice->>Player: Pause at current sentence
    Voice->>Voice: Default target is whole_sentence
    Voice->>API: Study request with intent=translate target=whole_sentence
    API->>LLM: Prompt for strict JSON
    LLM-->>API: Translation + target terms + cards
    API-->>Voice: Validated study response
    Voice->>Tray: Show margin annotation
    Voice->>DB: Save study event and flashcards
    User->>Voice: "last word"
    Voice->>Player: Resolve word_at_offset -1
    Voice->>API: Study request with intent=translate target=word_at_offset
    API->>LLM: Translate selected word in sentence context
    LLM-->>API: Word explanation JSON
    API-->>Tray: Word annotation and optional card
    User->>Voice: "LangStop explain this word"
    Voice->>API: Study request with intent=explain target=selected target
    API->>LLM: Ask for short explanation
    LLM-->>API: Explanation JSON
    API-->>Tray: Explanation and optional card
    User->>Voice: "LangStop resume"
    Voice->>Player: Resume playback
```

## Dictated Notes

```mermaid
stateDiagram-v2
    [*] --> Listening
    Listening --> NoteCapture: "LangStop notes begin"
    NoteCapture --> NoteCapture: append transcript chunks
    NoteCapture --> Listening: "LangStop notes end"
    Listening --> [*]: mic disabled

    note right of NoteCapture
      During note capture, narration should pause or duck.
      The note is linked to the active document and sentence.
    end note
```

## Flashcard Creation And Review

```mermaid
flowchart LR
    A["Translation or explanation"] --> B["Extract target terms"]
    B --> C["Generate context vocab cards"]
    C --> D["Save cards to IndexedDB"]
    D --> E["Show new cards in Study Tray"]
    E --> F{"User clicks undo?"}
    F -->|"Yes"| G["Delete card and linked event"]
    F -->|"No"| H["Card enters due review queue"]
    H --> I["User reviews card"]
    I --> J["Rate Again / Hard / Good / Easy"]
    J --> K["ts-fsrs schedules next due date"]
    K --> D
```

## End-To-End Demo Path

```mermaid
journey
    title LangStop Hackathon Demo
    section Setup
      Paste ElevenLabs key: 4: User
      Paste LLM key and choose provider: 4: User
      Choose native language: 5: User
    section Reading
      Import document: 4: User
      Start narration: 5: User
      Current sentence highlights: 5: User
    section Interruption
      Say LangStop translate: 5: User
      Translation appears as annotation: 5: User
      Refine with last word or whole sentence: 5: User
      Ask for explanation: 5: User
    section Capture
      Say LangStop bookmark: 4: User
      Dictate a note: 4: User
      Flashcard appears in Study Tray: 5: User
    section Review
      Open due review: 4: User
      Rate one card: 4: User
```
