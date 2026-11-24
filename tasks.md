# Task Breakdown

Granular plan derived from `architecture.md`. Each task is a single concern, sized at 1-2 hours, with a clear start/end and a verification step. Complete them in order, one at a time.

After `npm install` in Task 1, run `npx expo install --fix` once so every `expo-*` package is pinned to the SDK-compatible version.

## Task 1: Project scaffold + shared types + error plumbing
- Start: empty repo (README only).
- Do: create `package.json` (Expo SDK 54, RN 0.81, TS, zustand, and the four engine deps + `react-native-nitro-modules` peer), `app.json` (plugins: expo-sqlite, expo-file-system, expo-document-picker; newArchEnabled), `tsconfig.json` (strict, extends expo/tsconfig.base), `index.js` (registerRootComponent), `.gitignore`, the `src/` tree from architecture.md, `src/types/document.ts` (`DocumentFormat`, `DocumentMeta`, `Result<T>`, `formatFromFileName`), `src/core/errors.ts` (`AppError`, `toUserMessage`), and a placeholder `src/App.tsx`.
- End: folder tree matches architecture.md; pure modules executable in plain Node.
- Verify: `npm install`, then `npx tsc --noEmit` is clean; `node` smoke run of `src/types/document.ts` + `src/core/errors.ts` passes; `npx expo start` shows the placeholder screen on simulator.

## Task 2: Pure storage schema module
- Start: Task 1 done.
- Do: write `src/core/storage/schema.ts` with the DDL, all SQL statements as constants, and pure functions mapping DB rows to `DocumentMeta`. No imports from any native package.
- End: schema.ts is dependency-free and testable.
- Verify: a Node smoke test (`node` with type stripping) that runs the row<->meta mapping round-trip prints PASS.

## Task 3: expo-sqlite wrapper (db.ts)
- Start: schema.ts done.
- Do: write `src/core/storage/db.ts`: open `documents.db`, apply migrations from schema.ts, expose typed CRUD (`listDocuments`, `insertDocument`, `deleteDocument`, `touchDocument`, `getDocument`). Every call wrapped so failures reject with `AppError`.
- End: db.ts compiles; CRUD signatures match what the repository will call.
- Verify: on the simulator, app boots and a debug log shows the `documents` table exists with 0 rows.

## Task 4: Sandbox filesystem module
- Start: Task 3 done.
- Do: write `src/core/fs/paths.ts` (documents/ and thumbnails/ dirs under `FileSystem.documentDirectory`, created lazily) and `src/core/fs/documentFiles.ts` (`importFile`, `deleteFile`, `fileExists`, `readInfo`). All paths derived from `FileSystem.documentDirectory` only.
- End: no code path can produce a path outside the sandbox.
- Verify: import a sample PDF via a temporary debug button; file appears under `documentDirectory/documents/` (check via `expo-file-system` readDirectoryAsync log).

## Task 5: documentsRepository + reconcile
- Start: Tasks 3-4 done.
- Do: write `src/core/storage/documentsRepository.ts` as the single writer: `add` (copy then INSERT, rollback on failure), `remove` (DELETE then delete file+thumbnail), `touch`, `reconcile()` orphan sweep on boot.
- End: repository is the only module combining fs + db.
- Verify: import a file, kill the app, manually delete the file from the sandbox, relaunch: the row is gone after reconcile. Conversely, drop an orphan file into `documents/`, relaunch: the orphan is deleted.

## Task 6: Zustand documentsStore
- Start: Task 5 done.
- Do: write `src/core/store/documentsStore.ts`: state `{ documents, loading, error }`, actions `load()`, `add(meta)`, `remove(id)`, `touch(id)` delegating persistence to the repository.
- End: store holds only metadata; no engine state.
- Verify: Node test with a mocked repository: add/remove/touch update state in order; error path sets `error` instead of throwing.

## Task 7: Document list screen + import flow
- Start: Task 6 done.
- Do: `ui/screens/DocumentListScreen.tsx` (FlatList of cards, EmptyState, "Import document" button using `expo-document-picker` with the four MIME types), wire store.load() on mount, import -> repository.add -> store.
- End: list screen is the home screen in App.tsx.
- Verify: simulator shows EmptyState; import a PDF from Files: a card appears and persists across app restart.

## Task 8: DocumentCard + navigation stubs
- Start: Task 7 done.
- Do: `ui/components/DocumentCard.tsx` (thumbnail or format badge, name, formatted last-modified), `ui/navigation.ts` (state-based router), route by format to stub feature screens showing the file name.
- End: tapping a card opens the correct stub.
- Verify: tap each imported format: stub screen shows the file name and format.

## Task 9: PDF viewer adapter + screen
- Start: Task 8 done.
- Do: install `npm install react-native-pdf-jsi react-native-nitro-modules` (then `npx pod-install` for iOS; `npx expo run:ios`/`run:android` rebuilds native). Write `features/pdf/adapters/pdfViewAdapter.ts` (lazy guarded require, `isAvailable()`, typed Viewer component, error props) and `PdfViewerScreen.tsx` with EngineFallback.
- End: PDFs open in the native viewer.
- Verify: open a multi-page PDF on device: pages render, pinch-zoom works, page count fires `onLoadComplete`; corrupt PDF shows ErrorBanner, no crash.

## Task 10: PDF editor adapter + save flow
- Start: Task 9 done.
- Do: install `npm install @doko/react-native-pdf-editor` (PoDoFo; ensure Android minSdk >= 26 via expo-build-properties if the manifest merger complains). Write `pdfEditAdapter.ts` (`open(uri)`, annotate/add text, `save()` back to the same sandbox URI) and `PdfEditorScreen.tsx`; after save call `repository.touch(id)`.
- End: edits persist to the sandbox file.
- Verify: add a text annotation, save, close, reopen: annotation is still there; `last_modified` increased in the list card.

## Task 11: DOCX editor adapter + screen
- Start: Task 8 done.
- Do: install `npm install @shashimadushan/docx-editor-react-native react-native-webview` (check npm for the current version; pin it in package.json). Write `docxAdapter.ts` (read sandbox file -> base64 -> WebView props; autosave event -> write bytes back via documentFiles -> repository.touch) and `DocxEditorScreen.tsx`.
- End: DOCX opens in the touch-friendly WebView editor and autosaves locally.
- Verify: edit a paragraph, wait for autosave, kill and relaunch the app, reopen the DOCX: the edit persisted; fallback path (engine unavailable) shows DocumentIR read-only view.

## Task 12: anydoc converter core module
- Start: Task 5 done.
- Do: install `npm install react-native-anydoc react-native-nitro-modules`. Write `src/core/convert/anydocAdapter.ts`: `convertToIR(uri): Promise<DocumentIR>` with lazy guarded require, typed minimal DocumentIR types, and try/catch -> AppError.
- End: one shared converter for PPTX and XLSX.
- Verify: convert a sample .pptx: DocumentIR JSON is logged/inspectable; a corrupt .xlsx resolves to a friendly AppError, no crash.

## Task 13: PPTX viewer screen
- Start: Task 12 done.
- Do: `features/pptx/PptxViewerScreen.tsx` + `ui/components/ir/` renderers for slides (shapes positioned per the IR slide layout, text runs with styles).
- End: PPTX opens as a swipeable/read-only slide view.
- Verify: open a sample .pptx on device: slide list renders, text and layout match the source deck approximately.

## Task 14: XLSX viewer screen
- Start: Task 12 done.
- Do: `features/xlsx/XlsxViewerScreen.tsx`: sheet tabs + scrollable cell grid from the DocumentIR tables.
- End: XLSX opens read-only with sheet tabs.
- Verify: open a sample .xlsx: sheet tabs switch, cell values render in the grid.

## Task 15: Thumbnails
- Start: Tasks 7 and 9 done.
- Do: on import, generate a thumbnail (PDF: first-page render via the pdf-jsi adapter; other formats: a format-colored placeholder rendered to `thumbnails/<id>.png` or just NULL + badge). Update `thumbnail_path` via repository.
- End: cards show thumbnails.
- Verify: import 4 files of each format: each card shows a thumbnail or a correct format badge.

## Task 16: Search, sort, delete
- Start: Task 7 done.
- Do: add a search field (filters by name) and sort toggle (last modified / name) to DocumentListScreen; long-press card -> confirm -> `repository.remove(id)` + store update.
- End: list supports search/sort/delete with full sandbox cleanup.
- Verify: search filters the list; delete removes the card and the file disappears from `documents/` (verify via readDirectoryAsync log).

## Task 17: Global error surfacing audit
- Start: all feature screens exist.
- Do: wire `ErrorBanner` into every screen; verify every adapter call path converts errors to AppError; add a corrupt-file test asset for each format.
- End: no unhandled promise rejection or native crash path remains.
- Verify: feed a corrupt file of each format: each screen shows a friendly ErrorBanner and the app keeps running.

## Task 18: Offline guarantee audit + README
- Start: Task 17 done.
- Do: grep the codebase for `fetch(`, `XMLHttpRequest`, `http://`, `https://` (except docs/comments); confirm none in runtime code. Expand README with run instructions and the offline guarantee.
- End: README documents `npm install`, `npx expo install --fix`, `npx expo run:ios` / `run:android`, and the architecture.
- Verify: the grep finds zero network calls in `src/`; README instructions work from a clean clone.
