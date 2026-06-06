# Phase 4 Quiet Library UI Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the real Phase 4 reader UI visually match `design/quiet-library-prototype` while preserving the tested import, navigation, playback, fallback, and setup behavior.

**Architecture:** Keep `src/components/ReaderApp.tsx` as the integrated client component and `src/app/globals.css` as the production styling surface. Port the prototype's structure and class names into the real component, but keep existing `src/reader`, `src/data`, `src/setup`, and provider route calls as the source of behavior.

**Tech Stack:** Next.js App Router, React 19 client component, TypeScript, lucide-react, CSS, Vitest, ESLint, Next build.

---

## File Structure

- Modify: `src/app/layout.tsx`
  - Add the Google font preconnect/link tags used by `design/quiet-library-prototype/LangStop.html`.
  - Keep metadata and global stylesheet import unchanged.
- Modify: `src/components/ReaderApp.tsx`
  - Replace the simplified reader JSX with prototype-matching sections: `app`, `topbar`, `stage`, `page-wrap`, `page`, `margin-col`, `tray`, `command-pop`, `playbar`, and `scrim`/`sheet`.
  - Keep current Phase 4 behavior for text import, current sentence state, persistence, setup storage, play/pause, previous/next, speed, and browser TTS fallback.
  - Add local UI-only state for tray collapse, command popup, selected word, local annotation, bookmarks, notes, translations, and demo flashcards.
- Modify: `src/app/globals.css`
  - Replace the simplified current styling with a productionized adaptation of `design/quiet-library-prototype/styles.css`.
  - Preserve class names needed by the new `ReaderApp.tsx`.
- Reference only: `design/quiet-library-prototype/app.jsx`, `reader.jsx`, `controls.jsx`, `setup.jsx`, `data.jsx`, `styles.css`, `LangStop.html`
  - These files are the source of truth and should not be modified.

---

### Task 1: Add Prototype Fonts To The App Shell

**Files:**
- Modify: `src/app/layout.tsx`
- Reference: `design/quiet-library-prototype/LangStop.html:7-10`

- [ ] **Step 1: Update `src/app/layout.tsx` head content**

Use this structure so the production app loads the same serif and sans fonts as the prototype:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LangStop",
  description: "Voice-first language reading and study capture."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400;1,8..60,500&family=Hanken+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Run lint for this file**

Run: `npm run lint -- src/app/layout.tsx`

Expected: exits with code `0`.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "style: load Quiet Library fonts"
```

---

### Task 2: Port Prototype UI State And Helpers Into ReaderApp

**Files:**
- Modify: `src/components/ReaderApp.tsx`
- Reference: `design/quiet-library-prototype/app.jsx:62-245`
- Reference: `design/quiet-library-prototype/data.jsx:35-83`

- [ ] **Step 1: Extend imports**

Keep the existing imports and add only the icons needed by the prototype-matching controls:

```tsx
import {
  BookOpenText,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Eye,
  EyeOff,
  FileText,
  Import,
  Languages,
  ListChecks,
  Mic,
  PanelRight,
  Pause,
  Play,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  SpellCheck,
  Trash2,
  Volume2,
  X
} from "lucide-react";
```

- [ ] **Step 2: Add UI-only constants below `voiceOptions`**

```tsx
const speedOptions = [0.75, 1, 1.25, 1.5] as const;

const commandOptions = {
  playing: ["translate", "this word", "last word", "2 words ago", "bookmark", "notes begin"],
  paused: ["this word", "last word", "next word", "whole sentence", "explain", "resume"]
} as const;

const wordGloss: Record<string, { tr: string; pos: string; note?: string }> = {
  longtemps: { tr: "for a long time", pos: "adverb" },
  bougie: { tr: "candle", pos: "noun, feminine" },
  sommeil: { tr: "sleep", pos: "noun, masculine" },
  quatuor: {
    tr: "quartet",
    pos: "noun, masculine",
    note: "A musical ensemble of four performers, or a composition for four voices or instruments."
  }
};

interface ReaderAnnotation {
  mode: "word" | "sentence";
  source: string;
  translation: string;
  meta: string;
  note?: string;
  carded: boolean;
}

interface StudyItem {
  id: string;
  source: string;
  detail?: string;
  meta?: string;
}

function tokenizeDisplayText(text: string): string[] {
  return text.match(/[^\s]+|\s+/g) ?? [];
}

function isDisplayWord(token: string): boolean {
  return /[A-Za-zÀ-ÿ’']/.test(token);
}

function cleanWord(token: string): string {
  return token.replace(/[«».,;:!?“”()]/g, "").toLowerCase();
}
```

- [ ] **Step 3: Add UI-only state inside `ReaderApp` after existing state declarations**

```tsx
const [trayCollapsed, setTrayCollapsed] = useState(false);
const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
const [annotation, setAnnotation] = useState<ReaderAnnotation | null>(null);
const [listening, setListening] = useState(false);
const [heardCommand, setHeardCommand] = useState("");
const [bookmarks, setBookmarks] = useState<StudyItem[]>([]);
const [notes, setNotes] = useState<StudyItem[]>([]);
const [translations, setTranslations] = useState<StudyItem[]>([]);
const [cards, setCards] = useState<StudyItem[]>([]);
const [showElevenKey, setShowElevenKey] = useState(false);
const [showLlmKey, setShowLlmKey] = useState(false);
```

- [ ] **Step 4: Add derived UI labels after `progressLabel`**

```tsx
const providerLabel =
  providerOptions.find((provider) => provider.id === preferences.provider)?.label ?? "DeepSeek";
const voiceLabel =
  voiceOptions.find((voice) => voice.id === preferences.voiceId)?.label ?? "Charlotte";
const activeCommands = playback === "playing" ? commandOptions.playing : commandOptions.paused;
const trayCount = bookmarks.length + notes.length + translations.length + cards.length;
```

- [ ] **Step 5: Add UI-only action helpers before `return`**

```tsx
function addTranslation(item: StudyItem) {
  setTranslations((current) => [item, ...current].slice(0, 6));
}

function addCard(source: string, detail: string) {
  const id = `card-${Date.now()}`;
  setCards((current) => [{ id, source, detail, meta: "New card" }, ...current].slice(0, 5));
  setAnnotation((current) => (current ? { ...current, carded: true } : current));
  setTrayCollapsed(false);
}

function translateCurrentSentence() {
  if (!currentSentence) return;
  const nextAnnotation: ReaderAnnotation = {
    mode: "sentence",
    source: currentSentence.text,
    translation: "Whole-sentence translation will connect in Phase 5.",
    meta: preferences.model,
    carded: false
  };
  setAnnotation(nextAnnotation);
  setSelectedWordIndex(null);
  addTranslation({
    id: `translation-${Date.now()}`,
    source: currentSentence.text,
    detail: nextAnnotation.translation,
    meta: `${providerLabel} · sentence`
  });
}

function selectWord(wordIndex: number, token: string) {
  const cleaned = cleanWord(token);
  const gloss = wordGloss[cleaned] ?? {
    tr: "Word translation will connect in Phase 5.",
    pos: "word"
  };
  setSelectedWordIndex(wordIndex);
  setAnnotation({
    mode: "word",
    source: token,
    translation: gloss.tr,
    meta: gloss.pos,
    note: gloss.note,
    carded: false
  });
  addTranslation({
    id: `translation-${Date.now()}`,
    source: token,
    detail: gloss.tr,
    meta: `${providerLabel} · word`
  });
}

function addBookmark() {
  if (!currentSentence) return;
  setBookmarks((current) => [
    { id: `bookmark-${Date.now()}`, source: currentSentence.text, meta: progressLabel },
    ...current
  ].slice(0, 5));
  setTrayCollapsed(false);
}

function addNote() {
  setNotes((current) => [
    { id: `note-${Date.now()}`, source: "Voice note placeholder — Phase 5 will capture dictated notes." },
    ...current
  ].slice(0, 5));
  setTrayCollapsed(false);
}

function runCommand(command: string) {
  setHeardCommand(command);
  if (command === "translate" || command === "whole sentence" || command === "explain") {
    translateCurrentSentence();
  }
  if (command === "bookmark") {
    addBookmark();
  }
  if (command === "notes begin") {
    addNote();
  }
  if (command === "resume") {
    void playCurrentSentence();
  }
  window.setTimeout(() => {
    setListening(false);
    setHeardCommand("");
  }, 520);
}
```

- [ ] **Step 6: Run typecheck through build after helper additions**

Run: `npm run build`

Expected: exits with code `0` or only fails because JSX has not been ported yet. If TypeScript reports unused helpers, continue to Task 3 before fixing.

---

### Task 3: Replace ReaderApp Markup With Prototype-Matching Structure

**Files:**
- Modify: `src/components/ReaderApp.tsx`
- Reference: `design/quiet-library-prototype/app.jsx:248-324`
- Reference: `design/quiet-library-prototype/reader.jsx:29-134`
- Reference: `design/quiet-library-prototype/controls.jsx:5-151`
- Reference: `design/quiet-library-prototype/setup.jsx:25-120`

- [ ] **Step 1: Replace the current `return` block with the prototype shell**

The replacement must include these top-level children in order:

```tsx
return (
  <div className="app" data-hl="wash" data-texture="subtle">
    <div className="paper-grain fixed-grain" />
    {/* topbar */}
    {/* stage with reader and tray */}
    {/* command popup when listening */}
    {/* playback bar */}
    {/* setup sheet when setupOpen */}
  </div>
);
```

- [ ] **Step 2: Implement topbar markup**

Use the prototype class names and wire buttons to existing state:

```tsx
<header className="topbar">
  <div className="wordmark">
    <span className="mark"><span className="lang">Lang</span><span className="stop">Stop</span></span>
    <span className="sub desktop-only">Reader</span>
  </div>
  <div className="topbar-right">
    <div className="status-pill desktop-only">
      <span className={elevenLabsKey ? "status-dot" : "status-dot off"} />
      <span className="prov-label">Voice</span>
      <span className="sep" />
      <span className="prov">{providerLabel}</span>
      <span className="muted-dot">·</span>
      <span className="prov">{preferences.nativeLanguage}</span>
    </div>
    <button className="icon-btn" type="button" data-tip-down="Import plain text" onClick={() => setTrayCollapsed(false)}>
      <Import size={18} aria-hidden="true" />
    </button>
    <button className="icon-btn" type="button" data-tip-down="Study Tray" onClick={() => setTrayCollapsed((current) => !current)}>
      <PanelRight size={18} aria-hidden="true" />
    </button>
    <button className="icon-btn" type="button" data-tip-down="Settings" onClick={() => setSetupOpen(true)}>
      <Settings size={18} aria-hidden="true" />
    </button>
  </div>
</header>
```

- [ ] **Step 3: Implement reader page markup**

Render sentences using `tokenizeDisplayText`, clickable word spans, active sentence classes, and the desktop margin annotation area. Keep the document text from `readerState.sentences`.

- [ ] **Step 4: Implement Study Tray markup**

Use class names `tray`, `tray-inner`, `tray-head`, `tray-body`, `tray-section`, `flashcard`, `tcard`, and `due-row`. Include the existing import textarea and import button inside the tray so Phase 4 import remains usable.

- [ ] **Step 5: Implement command popup markup**

Render the popup only when `listening` is true. Map `activeCommands` to clickable `cmd-chip` buttons. Call `runCommand(command)` on click.

- [ ] **Step 6: Implement playback bar markup**

Use class names `playbar-wrap`, `playbar`, `pb-btn`, `pb-play`, `pb-voice`, `pb-speed`, `pb-mic`, and `pb-translate`. Wire controls to `move`, `playCurrentSentence`, `stopPlayback`, `setSpeed`, `setListening`, and `translateCurrentSentence`.

- [ ] **Step 7: Implement setup sheet markup**

Use class names `scrim`, `sheet`, `sheet-head`, `sheet-body`, `sheet-foot`, `field`, `input-key`, `input`, `prov-grid`, `voice-grid`, `toggle-row`, `switch`, and `btn-primary`. Preserve existing `preferences`, `providerKeys`, `saveSetup`, and `clearKeys` behavior.

- [ ] **Step 8: Run lint and build**

Run: `npm run lint && npm run build`

Expected: both commands exit with code `0`.

- [ ] **Step 9: Commit**

```bash
git add src/components/ReaderApp.tsx
git commit -m "feat: port Quiet Library reader structure"
```

---

### Task 4: Replace Styling With Prototype-Aligned CSS

**Files:**
- Modify: `src/app/globals.css`
- Reference: `design/quiet-library-prototype/styles.css:1-724`

- [ ] **Step 1: Replace root variables and base styles**

Use the same design tokens as `design/quiet-library-prototype/styles.css:3-75`: ink, ivory, paper, desk, sage, copper, shadows, serif/sans font variables, paper grain, app scaffold, and selection color.

- [ ] **Step 2: Port topbar, status pill, icon button, tooltip, stage, reader scroll, page, sentence, word, annotation, playback, command popup, tray, setup sheet, and mobile sections**

Copy the prototype CSS sections from `design/quiet-library-prototype/styles.css` and adapt selectors only where the real JSX uses a different class name:

```css
.status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--sage-500); box-shadow: 0 0 0 3px rgba(137,149,121,0.18); }
.status-dot.off { background: var(--ink-300); box-shadow: none; }
.fixed-grain { position: fixed; z-index: 1; }
.muted-dot { color: var(--ink-300); }
```

- [ ] **Step 3: Keep mobile behavior from the prototype**

Verify the CSS includes:

```css
@media (max-width: 900px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block; }
  .page-wrap { grid-template-columns: 1fr; gap: 0; }
  .margin-col { display: none; }
  .playbar-wrap { bottom: 0; padding: 0; }
  .tray { position: absolute; left: 0; right: 0; bottom: 0; top: auto; width: 100% !important; height: 72vh; }
  .tray.collapsed { transform: translateY(101%); width: 100% !important; }
}
```

- [ ] **Step 4: Run lint and build**

Run: `npm run lint && npm run build`

Expected: both commands exit with code `0`.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "style: align reader with Quiet Library prototype"
```

---

### Task 5: Verify Phase 4 Behavior And Visual Match

**Files:**
- Read: `design/quiet-library-prototype/styles.css`
- Read: `design/quiet-library-prototype/app.jsx`
- Verify: `src/components/ReaderApp.tsx`
- Verify: `src/app/globals.css`

- [ ] **Step 1: Run the full automated checks**

Run: `npm test -- --run && npm run lint && npm run build`

Expected: tests, lint, and build all exit with code `0`.

- [ ] **Step 2: Start the development server**

Run: `npm run dev`

Expected: Next.js starts and prints a local URL, usually `http://localhost:3000`.

- [ ] **Step 3: Desktop browser inspection**

Open the app at the local URL and confirm:

- The first screen uses the prototype wordmark, topbar, status pill, centered paper page, right Study Tray, and floating dark playback bar.
- The active sentence uses a copper wash.
- The margin annotation area appears on desktop.
- The import textarea remains available in the tray and can import plain text.
- Play, pause, previous, next, and speed controls still work.

- [ ] **Step 4: Mobile browser inspection**

At a width below `900px`, confirm:

- The document becomes single-column.
- The playback bar becomes a bottom sheet.
- The Study Tray behaves like a bottom drawer.
- Margin annotations are hidden in favor of inline/mobile presentation.

- [ ] **Step 5: Commit verification notes if docs are updated**

Only if verification notes are added to an existing docs file:

```bash
git add docs/superpowers/plans/2026-06-06-phase-4-quiet-library-ui-alignment.md
git commit -m "docs: record Phase 4 UI verification"
```

---

## Self-Review

- Spec coverage: The plan covers prototype font loading, app shell, topbar, reading surface, active sentence/word styling, command popup, playback bar, Study Tray, setup sheet, behavior preservation, and desktop/mobile verification.
- Placeholder scan: No unresolved placeholders or undefined future phase work is required for this slice. Later-phase behavior is explicitly represented as placeholder/demo UI state.
- Type consistency: State types are defined before use. Helper names used in markup are defined in Task 2. Existing behavior functions remain from the current `ReaderApp.tsx`.
