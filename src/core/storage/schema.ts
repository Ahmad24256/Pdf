import type { DocumentFormat, DocumentMeta } from '../../types/document';

export const DB_NAME = 'documents.db';

export const DDL = `
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  uri TEXT NOT NULL UNIQUE,
  format TEXT NOT NULL CHECK (format IN ('pdf','docx','pptx','xlsx')),
  last_modified INTEGER NOT NULL,
  thumbnail_path TEXT
);
CREATE INDEX IF NOT EXISTS idx_documents_last_modified ON documents (last_modified DESC);
`;

const COLUMNS = 'id, name, uri, format, last_modified, thumbnail_path';

export const SQL = {
  list: `SELECT ${COLUMNS} FROM documents ORDER BY last_modified DESC`,
  getById: `SELECT ${COLUMNS} FROM documents WHERE id = ?`,
  insert: `INSERT INTO documents (${COLUMNS}) VALUES (?, ?, ?, ?, ?, ?)`,
  delete: 'DELETE FROM documents WHERE id = ?',
  touch: 'UPDATE documents SET last_modified = ? WHERE id = ?',
  setThumbnail: 'UPDATE documents SET thumbnail_path = ? WHERE id = ?',
  allUris: 'SELECT uri FROM documents',
} as const;

export interface DocumentRow {
  id: string;
  name: string;
  uri: string;
  format: string;
  last_modified: number;
  thumbnail_path: string | null;
}

export type InsertParams = [string, string, string, string, number, string | null];

const FORMATS: readonly string[] = ['pdf', 'docx', 'pptx', 'xlsx'];

export function rowToMeta(row: DocumentRow): DocumentMeta {
  if (!FORMATS.includes(row.format)) {
    throw new Error(`Unknown document format in database: ${row.format}`);
  }
  return {
    id: row.id,
    name: row.name,
    uri: row.uri,
    format: row.format as DocumentFormat,
    lastModified: row.last_modified,
    thumbnailPath: row.thumbnail_path,
  };
}

export function metaToInsertParams(meta: DocumentMeta): InsertParams {
  return [meta.id, meta.name, meta.uri, meta.format, meta.lastModified, meta.thumbnailPath];
}
