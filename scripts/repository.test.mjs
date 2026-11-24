import assert from 'node:assert/strict';
import { __seed, __reset as resetFs, __remove } from './expo-file-system.mock.mjs';
import { __reset as resetDb, __failNextInsert } from './expo-sqlite.mock.mjs';

resetFs();
resetDb();
const paths = await import('../src/core/fs/paths.ts');
const files = await import('../src/core/fs/documentFiles.ts');
const repo = await import('../src/core/storage/documentsRepository.ts');

await paths.ensureSandboxDirs();

__seed('file:///external/a.pdf', 'A-BYTES');
const meta = await repo.addDocument('file:///external/a.pdf', 'A.pdf');
assert.ok(meta.uri.startsWith(paths.documentsDir()));
assert.deepEqual(await repo.listDocuments(), [meta]);
assert.deepEqual(await files.listDocumentUris(), [meta.uri]);

__failNextInsert();
__seed('file:///external/b.docx', 'B-BYTES');
await assert.rejects(
  () => repo.addDocument('file:///external/b.docx', 'B.docx'),
  (e) => e.name === 'AppError',
);
assert.deepEqual(await files.listDocumentUris(), [meta.uri], 'failed insert must roll back the copied file');
assert.equal((await repo.listDocuments()).length, 1);

__remove(meta.uri);
await repo.reconcile();
assert.deepEqual(await repo.listDocuments(), [], 'row without file must be removed by reconcile');

__seed(`${paths.documentsDir()}orphan.pdf`, 'X');
__seed(`${paths.thumbnailsDir()}orphan.png`, 'T');
await repo.reconcile();
assert.deepEqual(await files.listDocumentUris(), [], 'orphan file must be deleted by reconcile');
assert.deepEqual(await files.listThumbnailUris(), [], 'orphan thumbnail must be deleted by reconcile');

__seed('file:///external/c.xlsx', 'C');
const m2 = await repo.addDocument('file:///external/c.xlsx', 'C.xlsx');
assert.equal((await repo.listDocuments()).length, 1);
assert.equal((await repo.getDocument(m2.id)).name, 'C.xlsx');

await repo.setDocumentThumbnail(m2.id, paths.thumbnailPath(m2.id));
assert.equal((await repo.getDocument(m2.id)).thumbnailPath, paths.thumbnailPath(m2.id));

await repo.touchDocumentById(m2.id, 9999);
assert.equal((await repo.getDocument(m2.id)).lastModified, 9999);

await repo.removeDocument(m2.id);
assert.deepEqual(await repo.listDocuments(), []);
assert.deepEqual(await files.listDocumentUris(), []);

await assert.rejects(() => repo.removeDocument('missing-id'), (e) => e.name === 'AppError');

console.log('REPOSITORY TEST PASS');
