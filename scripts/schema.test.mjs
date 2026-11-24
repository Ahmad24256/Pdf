import assert from 'node:assert/strict';
import { DDL, SQL, rowToMeta, metaToInsertParams } from '../src/core/storage/schema.ts';

assert.match(DDL, /CREATE TABLE IF NOT EXISTS documents/);
assert.match(DDL, /CHECK \(format IN \('pdf','docx','pptx','xlsx'\)\)/);
for (const key of ['list', 'getById', 'insert', 'delete', 'touch', 'setThumbnail', 'allUris']) {
  assert.equal(typeof SQL[key], 'string', `SQL.${key} must be a string`);
  assert.ok(SQL[key].length > 0);
}

const meta = {
  id: '3f6b2c1a-1111-4222-8333-944455556666',
  name: 'Report.pdf',
  uri: 'file:///sandbox/documents/3f6b2c1a-1111-4222-8333-944455556666.pdf',
  format: 'pdf',
  lastModified: 1735689600000,
  thumbnailPath: null,
};

const params = metaToInsertParams(meta);
assert.deepEqual(params, [meta.id, meta.name, meta.uri, 'pdf', meta.lastModified, null]);

const row = {
  id: params[0],
  name: params[1],
  uri: params[2],
  format: params[3],
  last_modified: params[4],
  thumbnail_path: params[5],
};
assert.deepEqual(rowToMeta(row), meta);

assert.throws(() => rowToMeta({ ...row, format: 'exe' }), /Unknown document format/);

console.log('SCHEMA TEST PASS');
