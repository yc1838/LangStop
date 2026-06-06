# Phase 2 Local Data Layer Design

## Scope

Phase 2 adds browser-local persistence primitives for LangStop. It does not add UI wiring, provider calls, file extraction, playback, or review scheduling logic. The goal is a tested data boundary that later phases can call from reader, capture, and review flows.

## Architecture

The data layer lives under `src/data`. Dexie owns IndexedDB tables for reader and study records. Settings and API key storage are separate from IndexedDB because key lifetime rules differ from durable app data.

Tests run in Node with `fake-indexeddb`, so persistence behavior is verified without a browser.

## Data Model

IndexedDB stores:

- documents
- reading positions
- bookmarks
- notes
- study events
- flashcards
- review logs

Each persisted record has caller-visible ids and timestamp fields so later UI flows can render and order records without hidden Dexie state.

## Settings And Keys

Non-secret preferences persist to local storage. API keys are session-only by default. When `rememberKeys` is enabled, keys move to local storage and are removed from session storage. `clearProviderKeys` removes keys from both stores.

## Testing

Tests cover save/restore for the document state, study artifacts, flashcards, review logs, and the key persistence boundary. Phase 2 is complete when `npm test`, `npm run lint`, and `npm run build` pass.

