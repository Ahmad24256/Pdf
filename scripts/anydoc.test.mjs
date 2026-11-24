import assert from 'node:assert/strict';
import { __seed, __reset as resetFs } from './expo-file-system.mock.mjs';

resetFs();
const paths = await import('../src/core/fs/paths.ts');
await paths.ensureSandboxDirs();
const { convertFileToIr, isAnydocAvailable } = await import('../src/core/convert/anydocAdapter.ts');

assert.ok(isAnydocAvailable());

__seed(`${paths.documentsDir()}deck.pptx`, 'PK fake pptx bytes');
const ok = await convertFileToIr(`${paths.documentsDir()}deck.pptx`);
assert.equal(ok.ok, true);
assert.deepEqual(ok.ir, { kind: 'presentation', pages: [{ index: 0 }] });
assert.deepEqual(ok.warnings, []);

__seed(`${paths.documentsDir()}broken.xlsx`, 'not a real file');
const bad = await convertFileToIr(`${paths.documentsDir()}broken.xlsx`);
assert.equal(bad.ok, false);
assert.equal(bad.reason, 'parse-error');

console.log('ANYDOC TEST PASS');
