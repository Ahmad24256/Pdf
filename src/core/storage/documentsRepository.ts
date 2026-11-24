import type { DocumentMeta } from '../../types/document';
import { AppError, asAppError } from '../errors';
import { deleteDocumentFiles, deleteUri, importFile, listDocumentUris, listThumbnailUris } from '../fs/documentFiles';
import { deleteDocument, getDocument, insertDocument, listDocuments, setThumbnail, touchDocument } from './db';

export { getDocument, listDocuments };

export async function addDocument(sourceUri: string, name: string): Promise<DocumentMeta> {
  const meta = await importFile(sourceUri, name);
  try {
    await insertDocument(meta);
  } catch (error) {
    await deleteUri(meta.uri).catch(() => undefined);
    throw error;
  }
  return meta;
}

export async function removeDocument(id: string): Promise<void> {
  const meta = await getDocument(id);
  if (!meta) {
    throw new AppError('This document is not in the library.');
  }
  await deleteDocument(id);
  await deleteDocumentFiles(meta.uri, meta.thumbnailPath).catch(() => undefined);
}

export async function touchDocumentById(id: string, lastModified?: number): Promise<void> {
  await touchDocument(id, lastModified);
}

export async function setDocumentThumbnail(id: string, path: string | null): Promise<void> {
  await setThumbnail(id, path);
}

export async function reconcile(): Promise<void> {
  try {
    const metas = await listDocuments();
    const fileUris = new Set(await listDocumentUris());
    for (const meta of metas) {
      if (!fileUris.has(meta.uri)) {
        await deleteDocument(meta.id).catch(() => undefined);
      }
    }
    const liveUris = new Set((await listDocuments()).map((m) => m.uri));
    for (const uri of await listDocumentUris()) {
      if (!liveUris.has(uri)) {
        await deleteUri(uri).catch(() => undefined);
      }
    }
    const liveThumbnails = new Set(
      (await listDocuments())
        .map((m) => m.thumbnailPath)
        .filter((p): p is string => p !== null),
    );
    for (const uri of await listThumbnailUris()) {
      if (!liveThumbnails.has(uri)) {
        await deleteUri(uri).catch(() => undefined);
      }
    }
  } catch (error) {
    throw asAppError(error, 'Could not synchronize local storage.');
  }
}
