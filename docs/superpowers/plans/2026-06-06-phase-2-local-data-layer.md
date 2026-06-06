# Phase 2 Local Data Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Dexie-backed local persistence and settings/key storage helpers for LangStop Phase 2.

**Architecture:** Keep IndexedDB records in `src/data/db.ts` and CRUD helpers in `src/data/repositories.ts`. Keep non-secret preferences and API key lifetime rules in `src/data/settings.ts`.

**Tech Stack:** TypeScript, Dexie, fake-indexeddb, Vitest.

---

### Task 1: Red Tests

**Files:**
- Create: `tests/data/local-data.test.ts`
- Create: `tests/data/settings.test.ts`

- [ ] Write failing tests for document save/restore, study artifacts, review logs, and settings/key persistence.
- [ ] Run `npm test -- --run tests/data` and confirm failures are due to missing data modules.

### Task 2: Data Layer

**Files:**
- Create: `src/data/db.ts`
- Create: `src/data/repositories.ts`
- Create: `src/data/settings.ts`
- Create: `src/data/index.ts`

- [ ] Implement the minimal Dexie schema and CRUD functions needed by the tests.
- [ ] Implement settings storage helpers with session-only keys by default.
- [ ] Run `npm test -- --run tests/data`.
- [ ] Run full `npm test -- --run`, `npm run lint`, and `npm run build`.

