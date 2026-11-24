import * as SQLite from 'expo-sqlite';
import type { DocumentMeta } from '../../types/document';
import { asAppError } from '../errors';
import { DB_NAME, DDL, SQL, metaToInsertParams, rowToMeta } from './schema';
import type { DocumentRow } from './schema';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb(): Promise<SQLite.SQLiteDatabase> {
  dbPromise ??= SQLite.openDatabaseAsync(DB_NAME).then(async (db) => {
    await db.execAsync(DDL);
    return db;
  });
  return dbPromise;
}

export async function listDocuments(): Promise<DocumentMeta[]> {
  try {
    const db = await getDb();
    const rows = await db.getAllAsync<DocumentRow>(SQL.list);
    return rows.map(rowToMeta);
  } catch (error) {
    throw asAppError(error, 'Could not load the document library.');
  }
}

export async function getDocument(id: string): Promise<DocumentMeta | null> {
  try {
    const db = await getDb();
    const row = await db.getFirstAsync<DocumentRow>(SQL.getById, [id]);
    return row ? rowToMeta(row) : null;
  } catch (error) {
    throw asAppError(error, 'Could not load this document.');
  }
}

export async function insertDocument(meta: DocumentMeta): Promise<void> {
  try {
    const db = await getDb();
    await db.runAsync(SQL.insert, metaToInsertParams(meta));
  } catch (error) {
    throw asAppError(error, 'Could not add this document to the library.');
  }
}

export async function deleteDocument(id: string): Promise<void> {
  try {
    const db = await getDb();
    await db.runAsync(SQL.delete, [id]);
  } catch (error) {
    throw asAppError(error, 'Could not remove this document.');
  }
}

export async function touchDocument(id: string, lastModified: number = Date.now()): Promise<void> {
  try {
    const db = await getDb();
    await db.runAsync(SQL.touch, [lastModified, id]);
  } catch (error) {
    throw asAppError(error, 'Could not update this document.');
  }
}

export async function setThumbnail(id: string, thumbnailPath: string | null): Promise<void> {
  try {
    const db = await getDb();
    await db.runAsync(SQL.setThumbnail, [thumbnailPath, id]);
  } catch (error) {
    throw asAppError(error, 'Could not update the thumbnail.');
  }
}

export async function listUris(): Promise<string[]> {
  try {
    const db = await getDb();
    const rows = await db.getAllAsync<{ uri: string }>(SQL.allUris);
    return rows.map((row) => row.uri);
  } catch (error) {
    throw asAppError(error, 'Could not load the document library.');
  }
}
