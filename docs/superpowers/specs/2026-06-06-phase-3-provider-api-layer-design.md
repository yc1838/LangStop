# Phase 3 Provider API Layer Design

## Scope

Phase 3 adds thin Next.js API route handlers and provider adapters for ElevenLabs TTS plus LLM command/study requests. It does not call real providers in tests, persist keys server-side, build UI, or add playback logic.

## Architecture

Provider logic lives under `src/providers`. API routes live under `src/app/api`. Routes validate request bodies with Zod, pass per-request API keys to provider adapters, normalize provider responses, and return safe response shapes. Provider errors never expose raw upstream bodies or keys.

## Routes

- `POST /api/elevenlabs/tts`: proxies sentence-level TTS and returns `audio/mpeg`.
- `POST /api/elevenlabs/tts-with-timestamps`: proxies ElevenLabs timestamp TTS and normalizes snake_case response fields.
- `POST /api/llm/command`: asks the selected LLM for a normalized command and validates it through the Phase 1 command domain.
- `POST /api/llm/study`: asks the selected LLM for translation/explanation study JSON and validates it through the Phase 1 study domain.

## Providers

The LLM factory supports OpenAI-compatible adapters for OpenAI, DeepSeek, Kimi/Moonshot, and custom endpoints. Claude and Gemini use provider-specific request/response envelopes. All adapters expose a shared JSON-returning function so the route layer stays provider-agnostic.

## Error Handling

Invalid client requests return `400` with `Invalid request.` Provider failures return `502` with `Provider request failed. Check your key, quota, and provider settings.` Missing or unusable ElevenLabs alignment is not an error; the timestamp route returns `timingAvailable: false` so the reader can fall back to whole-sentence behavior.

## Testing

Vitest route and adapter tests use mocked `fetch`. The phase is complete when focused provider/API tests, full unit tests, lint, and production build pass.

