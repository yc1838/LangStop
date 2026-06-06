# Phase 3 Provider API Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add mocked-tested provider adapters and Next.js API routes for LangStop Phase 3.

**Architecture:** Keep request schemas and provider adapters in `src/providers`; route handlers only validate input, call adapters, normalize output, and map errors.

**Tech Stack:** Next.js App Router route handlers, TypeScript, Zod, Vitest fetch mocks.

---

### Task 1: Red Tests

**Files:**
- Create: `tests/providers/elevenlabs.test.ts`
- Create: `tests/providers/llm.test.ts`
- Create: `tests/api/provider-routes.test.ts`

- [ ] Write tests for TTS proxying, timestamp normalization/fallback, LLM provider JSON parsing, route validation, and safe provider errors.
- [ ] Run `npm test -- --run tests/providers tests/api` and confirm failures are due to missing provider/API modules.

### Task 2: Provider Layer

**Files:**
- Create: `src/providers/errors.ts`
- Create: `src/providers/schemas.ts`
- Create: `src/providers/elevenlabs.ts`
- Create: `src/providers/llm.ts`
- Create: `src/providers/prompts.ts`
- Create: `src/providers/index.ts`

- [ ] Implement Zod request/response schemas.
- [ ] Implement ElevenLabs adapters with timestamp response normalization.
- [ ] Implement LLM provider factory and JSON response parsing.

### Task 3: API Routes

**Files:**
- Create: `src/app/api/elevenlabs/tts/route.ts`
- Create: `src/app/api/elevenlabs/tts-with-timestamps/route.ts`
- Create: `src/app/api/llm/command/route.ts`
- Create: `src/app/api/llm/study/route.ts`

- [ ] Implement route handlers with request validation and safe error mapping.
- [ ] Run focused tests, full tests, lint, and build.

