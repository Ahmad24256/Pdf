# Pdf

Cross-platform (iOS & Android) offline document reader/editor. Opens, renders, edits, and saves PDF, DOCX, PPTX, and XLSX entirely on the device. No backend, no cloud sync, no authentication, no network calls. Metadata in SQLite (`expo-sqlite`), files in the app sandbox (`expo-file-system`).

See [architecture.md](architecture.md), [tasks.md](tasks.md), and [agents.md](agents.md).

## Run

```
npm install
npx expo install --fix
npx expo run:ios      # or: npx expo run:android
```

For iOS after adding native dependencies: `npx pod-install` (or a fresh `npx expo run:ios`, which installs pods automatically).
