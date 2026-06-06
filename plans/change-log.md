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

- Change: Added the Quiet Library interface brief as a first-class documentation artifact.
- Reason: Earlier interface decisions needed to be preserved before implementation or external design work.
- Impact: UI implementation now has explicit layout, palette, component, and interaction acceptance criteria.
- Scope decision: in-scope.

- Change: Tightened Phase 0 documentation around key persistence, timed selection fallback, command parser confidence, paused navigation, and client-side FSRS.
- Reason: Documentation review found places where implementation behavior was implicit or inconsistent across diagrams and API shapes.
- Impact: Phase 1 domain tests and later provider/playback work now have clearer acceptance criteria.
- Scope decision: in-scope.
