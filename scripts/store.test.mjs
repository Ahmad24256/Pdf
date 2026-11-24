import assert from 'node:assert/strict';
import { __seed, __reset as resetFs } from './expo-file-system.mock.mjs';
import { __reset as resetDb } from './expo-sqlite.mock.mjs';

resetFs();
resetDb();
const paths = await import('../src/core/fs/paths.ts');
await paths.ensureSandboxDirs();
const { useDocumentsStore } = await import('../src/core/store/documentsStore.ts');

const state = () => useDocumentsStore.getState();
assert.deepEqual(state().documents, []);
assert.equal(state().loading, false);
assert.equal(state().error, null);

await state().load();
assert.equal(state().loading, false);
assert.deepEqual(state().documents, []);

__seed('file:///external/a.pdf', 'A');
const added = await state().add('file:///external/a.pdf', 'A.pdf');
assert.ok(added);
assert.equal(state().documents.length, 1);
assert.equal(state().error, null);

__seed('file:///external/b.pptx', 'B');
await state().add('file:///external/b.pptx', 'B.pptx');
assert.equal(state().documents.length, 2);
assert.equal(state().documents[0].name, 'B.pptx');

await new Promise((resolve) => setTimeout(resolve, 5));
await state().touch(added.id);
assert.equal(state().documents[0].id, added.id, 'touched document must sort to the top');
assert.ok(state().documents[0].lastModified > added.lastModified);

await state().setThumbnail(added.id, paths.thumbnailPath(added.id));
assert.equal(state().documents[0].thumbnailPath, paths.thumbnailPath(added.id));

await state().remove(added.id);
assert.equal(state().documents.length, 1);
assert.equal(state().documents[0].name, 'B.pptx');
assert.equal(state().error, null);

const rejected = await state().add('file:///external/x.png', 'x.png');
assert.equal(rejected, null);
assert.equal(state().documents.length, 1);
assert.match(state().error, /Unsupported file type/);

await state().load();
assert.equal(state().documents.length, 1, 'load must reflect persisted state');

console.log('STORE TEST PASS');
