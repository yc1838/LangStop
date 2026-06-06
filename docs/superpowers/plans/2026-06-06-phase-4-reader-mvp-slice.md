# Phase 4 Reader MVP Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first usable reader loop: import text, navigate sentences, and play with ElevenLabs-to-browser-TTS fallback.

**Architecture:** Keep import, reader state, and playback orchestration in pure modules under `src/reader`; wire them into a client component with restrained Quiet Library styling.

**Tech Stack:** Next.js App Router, React client component, TypeScript, Vitest, browser SpeechSynthesis fallback.

---

### Task 1: Red Tests

**Files:**
- Create: `tests/reader/import.test.ts`
- Create: `tests/reader/state.test.ts`
- Create: `tests/reader/playback.test.ts`

- [ ] Write tests for imported text documents, navigation, position snapshots, browser fallback, and timestamp timelines.
- [ ] Run `npm test -- --run tests/reader` and confirm failures are due to missing reader modules.

### Task 2: Reader Modules

**Files:**
- Create: `src/reader/import.ts`
- Create: `src/reader/state.ts`
- Create: `src/reader/playback.ts`
- Create: `src/reader/index.ts`

- [ ] Implement the minimal pure functions needed by tests.
- [ ] Run focused reader tests.

### Task 3: Reader UI

**Files:**
- Create: `src/components/ReaderApp.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

- [ ] Render text import, document page, highlighted active sentence, previous/play/next/speed controls, fallback state, and study tray placeholder.
- [ ] Run full tests, lint, build, and browser preview.

