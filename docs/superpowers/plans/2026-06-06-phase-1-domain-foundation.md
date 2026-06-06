# Phase 1 Domain Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Next.js/Vitest scaffold and tested pure domain foundation for LangStop Phase 1.

**Architecture:** Keep all real behavior in framework-agnostic `src/domain` modules. Add only a minimal app shell so scaffold commands have a target.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind, ESLint, Vitest, Zod.

---

### Task 1: Scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts`
- Create: `src/app/page.tsx`, `src/app/globals.css`

- [ ] Add package scripts for `dev`, `build`, `lint`, and `test`.
- [ ] Add minimal app shell that identifies Phase 1 as domain-foundation only.

### Task 2: Domain Tests

**Files:**
- Create: `tests/domain/sentences.test.ts`
- Create: `tests/domain/commands.test.ts`
- Create: `tests/domain/study.test.ts`
- Create: `tests/domain/timing.test.ts`
- Create: `tests/domain/hints.test.ts`

- [ ] Write failing Vitest tests for documented Phase 1 behavior.
- [ ] Run `npm test -- --run` and confirm failures are caused by missing modules.

### Task 3: Domain Implementation

**Files:**
- Create: `src/domain/sentences.ts`
- Create: `src/domain/commands.ts`
- Create: `src/domain/study.ts`
- Create: `src/domain/timing.ts`
- Create: `src/domain/hints.ts`
- Create: `src/domain/index.ts`

- [ ] Implement the smallest pure TypeScript functions that satisfy the tests.
- [ ] Run `npm test -- --run`.
- [ ] Run `npm run lint`.

