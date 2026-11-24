import assert from 'node:assert/strict';
import { __seed, __reset as resetFs } from './expo-file-system.mock.mjs';
import { __reset as resetDb } from './expo-sqlite.mock.mjs';

resetFs();
resetDb();
const paths = await import('../src/core/fs/paths.ts');
const files = await import('../src/core/fs/documentFiles.ts');
await paths.ensureSandboxDirs();
const { generatePdfThumbnail, isPdfEngineAvailable } = await import('../src/features/pdf/thumbnails.ts');

assert.ok(isPdfEngineAvailable());

const meta = {
  id: 'doc-thumb',
  name: 'A.pdf',
  uri: `${paths.documentsDir()}doc-thumb.pdf`,
  format: 'pdf',
  lastModified: 1,
  thumbnailPath: null,
};
__seed(meta.uri, 'PDF-BYTES');

const thumb = await generatePdfThumbnail(meta);
assert.equal(thumb, paths.thumbnailPath(meta.id));
assert.ok(await files.fileExists(thumb));
const content = Buffer.from(await files.readFileBase64(thumb), 'base64').toString('utf8');
assert.match(content, /^PNG:.*:0:png$/);

console.log('THUMB TEST PASS');
