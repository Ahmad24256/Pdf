import { SQL } from '../src/core/storage/schema.ts';

export function openDatabaseAsync(name) {
  if (typeof name !== 'string' || name.length === 0) {
    return Promise.reject(new Error('database name required'));
  }
  const rows = new Map();
  const db = {
    async execAsync(ddl) {
      if (!ddl.includes('CREATE TABLE IF NOT EXISTS documents')) {
        throw new Error('unexpected DDL');
      }
    },
    async runAsync(query, params = []) {
      if (query === SQL.insert) {
        const [id, name, uri, format, lastModified, thumbnailPath] = params;
        if (rows.has(id) || [...rows.values()].some((r) => r.uri === uri)) {
          throw new Error('UNIQUE constraint failed: documents.id or documents.uri');
        }
        rows.set(id, { id, name, uri, format, last_modified: lastModified, thumbnail_path: thumbnailPath });
        return { changes: 1, lastInsertRowId: rows.size };
      }
      if (query === SQL.delete) {
        rows.delete(params[0]);
        return { changes: 1, lastInsertRowId: 0 };
      }
      if (query === SQL.touch) {
        const row = rows.get(params[1]);
        if (row) row.last_modified = params[0];
        return { changes: row ? 1 : 0, lastInsertRowId: 0 };
      }
      if (query === SQL.setThumbnail) {
        const row = rows.get(params[1]);
        if (row) row.thumbnail_path = params[0];
        return { changes: row ? 1 : 0, lastInsertRowId: 0 };
      }
      throw new Error(`unexpected query: ${query}`);
    },
    async getAllAsync(query) {
      if (query === SQL.list) {
        return [...rows.values()].sort((a, b) => b.last_modified - a.last_modified);
      }
      if (query === SQL.allUris) {
        return [...rows.values()].map((r) => ({ uri: r.uri }));
      }
      throw new Error(`unexpected query: ${query}`);
    },
    async getFirstAsync(query, params = []) {
      if (query === SQL.getById) {
        return rows.get(params[0]) ?? null;
      }
      throw new Error(`unexpected query: ${query}`);
    },
  };
  return Promise.resolve(db);
}
