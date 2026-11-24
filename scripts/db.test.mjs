import assert from 'node:assert/strict';
import { __reset } from './expo-sqlite.mock.mjs';

__reset();
const db = await import('../src/core/storage/db.ts');

const meta = {
  id: 'doc-1',
  name: 'Report.pdf',
  uri: 'file:///sandbox/documents/doc-1.pdf',
  format: 'pdf',
  lastModified: 1000,
  thumbnailPath: null,
};

await db.insertDocument(meta);
assert.deepEqual(await db.getDocument(meta.id), meta);
assert.equal((await db.listDocuments()).length, 1);
assert.deepEqual(await db.listUris(), [meta.uri]);

await db.touchDocument(meta.id, 2000);
assert.equal((await db.getDocument(meta.id)).lastModified, 2000);

await db.setThumbnail(meta.id, 'file:///sandbox/thumbnails/doc-1.png');
assert.equal((await db.getDocument(meta.id)).thumbnailPath, 'file:///sandbox/thumbnails/doc-1.png');

await assert.rejects(
  () => db.insertDocument(meta),
  (e) => e.name === 'AppError' && typeof e.userMessage === 'string',
);

const meta2 = {
  id: 'doc-2',
  name: 'Deck.pptx',
  uri: 'file:///sandbox/documents/doc-2.pptx',
  format: 'pptx',
  lastModified: 3000,
  thumbnailPath: null,
};
await db.insertDocument(meta2);
assert.deepEqual((await db.listDocuments()).map((m) => m.id), ['doc-2', 'doc-1']);

await db.deleteDocument('doc-1');
assert.equal(await db.getDocument('doc-1'), null);
assert.equal((await db.listDocuments()).length, 1);

console.log('DB TEST PASS');
