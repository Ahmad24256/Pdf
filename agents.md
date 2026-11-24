# Engineering Principles

Follow these rules strictly on every task in this repository.

1. **Absolute minimum code.** Write the smallest amount of code that satisfies the task. No speculative features, no "while I'm here" refactors.
2. **No sweeping changes or unrelated edits.** Touch only the files the current task requires. Preserve all existing functionality and unrelated user work.
3. **Precise, modular, testable.** Small functions with explicit types, one concern per module, pure logic separated from native I/O so it can be unit-tested in plain Node.
4. **Never break existing functionality.** If a change would alter behavior of an existing screen or module, stop and reconsider; the app must keep working end to end.
5. **Native errors must never crash the app.** Wrap every call into a native library in try/catch (and every promise in `.catch`/try-await). Convert failures into `AppError` and surface `toUserMessage(error)` through `ErrorBanner`. If an engine is unavailable, degrade gracefully (read-only fallback via `EngineFallback`), never crash.
6. **Read the API documentation before using a native library.** Use the exact props, methods, and event names the library documents. Do not hallucinate APIs. If the docs are unclear, say so instead of guessing.
7. **Sandbox-only filesystem access.** Always build paths from `FileSystem.documentDirectory` (see `src/core/fs/paths.ts`). Never assume external storage permissions, never write outside the app sandbox, never request network access.
8. **100% offline.** No `fetch`, no `XMLHttpRequest`, no remote URLs in runtime code. No library that requires a server call or cloud processing may be added.
9. **Single writer for persistence.** Only `documentsRepository` mutates SQLite + files together. UI and stores call the repository; they never touch the DB or files directly.
10. **No code comments.** No standalone or inline comments in source files; keep names self-explanatory.
11. **Dependencies.** Do not add a dependency unless it is listed in the project technology constraints or the current task explicitly requires it. Expo SDK packages must be installed with `npx expo install <pkg>` (or `npm install` followed by `npx expo install --fix`) so versions stay SDK-compatible.
12. **TypeScript strict.** No `any` unless wrapping an untyped native boundary, and then with a narrow `unknown` + type guard in the adapter only.
