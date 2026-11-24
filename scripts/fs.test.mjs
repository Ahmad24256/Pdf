import assert from 'node:assert/strict';
import { __seed, __reset } from './expo-file-system.mock.mjs';

__reset();
const paths = await import('../src/core/fs/paths.ts');
const files = await import('../src/core/fs/documentFiles.ts');

await paths.ensureSandboxDirs();
assert.equal(paths.documentsDir(), 'file:///sandbox/documents/');
assert.equal(paths.thumbnailsDir(), 'file:///sandbox/thumbnails/');

__seed('file:///external/picker/report.pdf', 'PDF-BYTES');
const meta = await files.importFile('file:///external/picker/report.pdf', 'Report.PDF');
assert.equal(meta.format, 'pdf');
assert.equal(meta.name, 'Report.PDF');
assert.ok(meta.uri.startsWith(paths.documentsDir()), 'imported file must live inside the sandbox');
assert.ok(meta.uri.endsWith('.pdf'));
assert.equal(meta.thumbnailPath, null);
assert.ok(await files.fileExists(meta.uri));

const b64 = await files.readFileBase64(meta.uri);
assert.equal(b64, Buffer.from('PDF-BYTES', 'utf8').toString('base64'));

await files.writeFileBase64(meta.uri, Buffer.from('EDITED', 'utf8').toString('base64'));
assert.equal(await files.readFileBase64(meta.uri), Buffer.from('EDITED', 'utf8').toString('base64'));

assert.deepEqual(await files.listDocumentUris(), [meta.uri]);

await assert.rejects(
  () => files.importFile('file:///external/picker/photo.png', 'photo.png'),
  (e) => e.name === 'AppError' && /Unsupported file type/.test(e.userMessage),
);

await files.deleteDocumentFiles(meta.uri, null);
assert.equal(await files.fileExists(meta.uri), false);
assert.deepEqual(await files.listDocumentUris(), []);

console.log('FS TEST PASS');
