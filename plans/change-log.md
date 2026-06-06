# Change Log

## 2026-06-06

- Change: Created documentation-first project structure.
- Reason: The product now includes backend proxy routes, provider abstraction, voice workflows, and local study persistence; architecture should be agreed before implementation.
- Impact: Implementation will proceed phase by phase instead of one large pass.
- Scope decision: in-scope.

- Change: Added timed word selection and real-time command hint popup to the MVP documentation.
- Reason: The core demo benefits from choosing `whole sentence`, `this word`, `last word`, or `N words ago` after voice interruption.
- Impact: Implementation now needs a timestamped ElevenLabs path, token timeline domain logic, and command popup UI before the final voice-study capture demo is complete.
- Scope decision: in-scope.
