import assert from 'node:assert/strict';
import { __seed, __reset as resetFs } from './expo-file-system.mock.mjs';
import { __reset as resetDb } from './expo-sqlite.mock.mjs';

resetFs();
resetDb();
const paths = await import('../src/core/fs/paths.ts');
await paths.ensureSandboxDirs();
const { addTextAnnotation, getPageInfo, isPdfEditorAvailable } = await import('../src/features/pdf/adapters/pdfEditAdapter.ts');

assert.ok(isPdfEditorAvailable());

__seed(`${paths.documentsDir()}good.pdf`, 'PDF');
__seed(`${paths.documentsDir()}corrupt.pdf`, 'garbage');

const info = await getPageInfo(`${paths.documentsDir()}good.pdf`);
assert.deepEqual(info, { pageCount: 1, width: 612, height: 792 });

await addTextAnnotation(`${paths.documentsDir()}good.pdf`, { pageIndex: 0, text: 'hi', x: 50, y: 700 });

await assert.rejects(
  () => addTextAnnotation(`${paths.documentsDir()}corrupt.pdf`, { pageIndex: 0, text: 'hi', x: 50, y: 700 }),
  (e) => e.name === 'AppError' && /save the changes/.test(e.userMessage),
);
await assert.rejects(
  () => getPageInfo(`${paths.documentsDir()}corrupt.pdf`),
  (e) => e.name === 'AppError' && /read this PDF/.test(e.userMessage),
);

console.log('PDFEDIT TEST PASS');
