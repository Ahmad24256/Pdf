# Architecture: Offline Document Reader/Editor

A cross-platform (iOS & Android) React Native (Expo managed) app that opens, renders, edits, and saves PDF, DOCX, PPTX, and XLSX files **100% offline**. No backend, no cloud sync, no authentication, no network calls. Metadata lives in SQLite (`expo-sqlite`); raw files live in the app sandbox (`expo-file-system`, `FileSystem.documentDirectory`).

Stack: Expo SDK 54 (React Native 0.81, New Architecture enabled by default), TypeScript, Zustand for state, `expo-sqlite`, `expo-file-system`, `expo-document-picker` for import.

Engines (all on-device, no remote API):

- PDF viewing: `react-native-pdf-jsi` (New Architecture, PDFium on Android / PDFKit on iOS, Nitro Modules bridge).
- PDF editing: `@doko/react-native-pdf-editor` (PoDoFo-based, Nitro Modules).
- DOCX editing: `@shashimadushan/docx-editor-react-native` (WebView-based, touch-friendly, autosave).
- PPTX/XLSX: `react-native-anydoc` (Rust, converts to a JSON DocumentIR that we render with our own React Native components).

## 1. File + Folder Structure

```
/
├── app.json                          # Expo config; plugins for expo-sqlite/file-system/document-picker
├── package.json                      # the ONLY place native engine deps are declared
├── tsconfig.json                     # extends expo/tsconfig.base, strict
├── index.js                          # registerRootComponent(App)
├── architecture.md                   # this file
├── tasks.md                          # granular implementation plan
├── agents.md                         # engineering rules
└── src/
    ├── App.tsx                       # boot: open DB, run reconcile(), render current screen
    ├── types/
    │   └── document.ts               # DocumentFormat, DocumentMeta, Result<T>, formatFromFileName()
    ├── core/
    │   ├── errors.ts                 # AppError + toUserMessage(): every failure becomes friendly text
    │   ├── storage/
    │   │   ├── schema.ts             # PURE module: DDL, SQL statements, row<->DocumentMeta mapping; no native imports (unit-testable in plain Node)
    │   │   ├── db.ts                 # expo-sqlite wrapper: open DB, run migrations, typed CRUD built on schema.ts
    │   │   └── documentsRepository.ts# SINGLE WRITER: coordinates filesystem + SQLite, reconcile()/orphan sweep
    │   ├── fs/
    │   │   ├── paths.ts              # sandbox dirs: documentDirectory + 'documents/' and 'thumbnails/'
    │   │   └── documentFiles.ts      # import/copy/delete/rename/stat; every path stays inside the sandbox
    │   ├── convert/
    │   │   └── anydocAdapter.ts      # react-native-anydoc -> DocumentIR (shared by pptx + xlsx features)
    │   └── store/
    │       └── documentsStore.ts     # Zustand store: DocumentMeta[] + actions (load/add/remove/touch)
    ├── features/
    │   ├── pdf/
    │   │   ├── adapters/
    │   │   │   ├── pdfViewAdapter.ts # wraps react-native-pdf-jsi behind a typed interface + lazy guarded require
    │   │   │   └── pdfEditAdapter.ts # wraps @doko/react-native-pdf-editor behind a typed interface
    │   │   ├── PdfViewerScreen.tsx
    │   │   └── PdfEditorScreen.tsx
    │   ├── docx/
    │   │   ├── adapters/
    │   │   │   └── docxAdapter.ts    # wraps @shashimadushan/docx-editor-react-native (WebView, base64 file transfer, autosave)
    │   │   └── DocxEditorScreen.tsx
    │   ├── pptx/
    │   │   └── PptxViewerScreen.tsx  # renders DocumentIR slides
    │   └── xlsx/
    │       └── XlsxViewerScreen.tsx  # renders DocumentIR sheets/cells
    └── ui/
        ├── navigation.ts             # tiny state-based router (screen + params), no extra dependency
        ├── screens/
        │   └── DocumentListScreen.tsx# home: search, sort, import button, document cards
        └── components/
            ├── DocumentCard.tsx      # thumbnail, name, format badge, last modified
            ├── EmptyState.tsx
            ├── ErrorBanner.tsx       # surfaces toUserMessage() of the last AppError
            ├── EngineFallback.tsx    # shown when a native engine is unavailable (read-only degradation)
            └── ir/                   # DocumentIR renderers: IrParagraph, IrTable, IrSlide, IrSheet, ...
```

## 2. State Management

Pattern: **Zustand**, one store (`documentsStore`) for persistent document metadata. Engine-specific transient state (current PDF page, editor dirty flag, annotations in progress) lives in the feature screen's local React state and never enters the global store.

Data flow:

1. User picks a file with `expo-document-picker` (system UI; the picked URI is temporary and outside our control).
2. `documentFiles.importFile()` copies the bytes into `FileSystem.documentDirectory + 'documents/<id>.<ext>'`.
3. `documentsRepository.add()` inserts the SQLite row and returns the `DocumentMeta`; on DB failure the copied file is deleted (rollback).
4. `documentsStore` updates the list; the list screen re-renders.
5. User taps a card -> `navigation` pushes the feature screen for `meta.format` with the `DocumentMeta` as params.
6. The screen calls only the **adapter** with `meta.uri` (a sandbox `file://` path) plus callbacks. Native libraries never receive app state; they get a URI and return events.
7. On save, the adapter writes back to the same sandbox URI; the screen calls `documentsRepository.touch(id)` to bump `last_modified`, and the store refreshes the card.

Rule: all persistence decisions go through `documentsRepository`. UI and store never touch SQLite or the filesystem directly.

## 3. Data Schema (SQLite)

Database file: `documents.db` (opened via `expo-sqlite`). Single table:

```sql
CREATE TABLE IF NOT EXISTS documents (
  id             TEXT PRIMARY KEY,                       -- uuid v4 generated in JS
  name           TEXT NOT NULL,                          -- original file name
  uri            TEXT NOT NULL UNIQUE,                   -- file:// path inside the app sandbox
  format         TEXT NOT NULL CHECK (format IN ('pdf','docx','pptx','xlsx')),
  last_modified  INTEGER NOT NULL,                       -- epoch ms, bumped on every save
  thumbnail_path TEXT                                    -- nullable, path under thumbnails/
);
CREATE INDEX IF NOT EXISTS idx_documents_last_modified ON documents (last_modified DESC);
```

Field semantics:

- `id`: stable primary key; also the sandbox file name (`documents/<id>.<ext>`), so row and file are linked 1:1.
- `uri`: always `FileSystem.documentDirectory + 'documents/...'`; never an external/provider URI.
- `last_modified`: updated by `touch()` after every successful save by an engine.
- `thumbnail_path`: `thumbnails/<id>.png` or NULL while no thumbnail exists.

Filesystem <-> SQLite consistency (enforced in `documentsRepository`, the single writer):

- **Import**: copy file into sandbox first; only then INSERT. If INSERT fails, delete the copied file.
- **Delete**: DELETE row first; then delete file and thumbnail. If file deletion fails, the row is already gone and the orphan sweep cleans the file at next boot.
- **Save/edit**: engines write to the existing sandbox URI in place; the repository only updates `last_modified` (no new row, no rename).
- **Boot reconcile** (`reconcile()` called once from `App.tsx`): rows whose `uri` no longer exists on disk are deleted; files under `documents/` and `thumbnails/` with no matching row are deleted. After reconcile, filesystem and SQLite are guaranteed to agree.

## 4. Native Module Isolation

Each native engine is hidden behind a small typed adapter in `features/<format>/adapters/`. UI code imports only the adapter interface, never the native package.

Adapter shape (example for PDF viewing):

```ts
interface PdfViewAdapter {
  isAvailable(): boolean;                       // false if the native module failed to load
  Viewer: ComponentType<PdfViewerProps>;        // props: uri, onLoadComplete?, onError?
}
```

Isolation rules:

- The adapter loads the native library **lazily** with a guarded `require()` inside try/catch. If the module is missing or throws at load time, `isAvailable()` returns false instead of crashing the bundle.
- Every adapter method is async, wrapped in try/catch, and converts failures into `AppError` with a user-friendly message surfaced through `ErrorBanner` (`core/errors.ts` -> `toUserMessage()`).
- Screens check `isAvailable()` first and render `ui/components/EngineFallback.tsx` when false.

Graceful degradation matrix:

| Failure | Behavior |
|---|---|
| PDF viewer engine unavailable/broken | EngineFallback: file name + "viewer unavailable"; app stays usable |
| PDF editor engine fails on a file | Fall back to read-only PDF viewer |
| DOCX editor engine fails | Convert the DOCX with `react-native-anydoc` and show the read-only DocumentIR view |
| PPTX/XLSX conversion fails (corrupt file) | ErrorBanner: "This file could not be parsed"; no crash |
| SQLite open/migrate fails | App boots into a degraded mode with an ErrorBanner; no file is ever deleted |

DOCX specifics: the WebView editor never touches the filesystem itself. The adapter reads the sandbox file, passes it to the WebView as base64, and on autosave writes the returned bytes back to the same sandbox URI through `documentFiles`.
