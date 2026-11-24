import * as FileSystem from 'expo-file-system/legacy';
import type { DocumentFormat, DocumentMeta } from '../../types/document';
import { formatFromFileName } from '../../types/document';
import { AppError, asAppError } from '../errors';
import { documentsDir, ensureSandboxDirs, thumbnailsDir } from './paths';

export function newDocumentId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function documentPath(id: string, format: DocumentFormat): string {
  return `${documentsDir()}${id}.${format}`;
}

export function uriToPath(uri: string): string {
  return uri.startsWith('file://') ? uri.slice('file://'.length) : uri;
}

export async function importFile(sourceUri: string, name: string): Promise<DocumentMeta> {
  const format = formatFromFileName(name);
  if (!format) {
    throw new AppError('Unsupported file type. Supported formats: PDF, DOCX, PPTX, XLSX.');
  }
  try {
    await ensureSandboxDirs();
    const id = newDocumentId();
    const uri = documentPath(id, format);
    await FileSystem.copyAsync({ from: sourceUri, to: uri });
    return { id, name, uri, format, lastModified: Date.now(), thumbnailPath: null };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw asAppError(error, 'Could not import this file into the app.');
  }
}

export async function fileExists(uri: string): Promise<boolean> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists;
  } catch (error) {
    throw asAppError(error, 'Could not check whether the file exists.');
  }
}

export async function copyFile(from: string, to: string): Promise<void> {
  try {
    await FileSystem.copyAsync({ from, to });
  } catch (error) {
    throw asAppError(error, 'Could not copy this file.');
  }
}

export async function deleteUri(uri: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch (error) {
    throw asAppError(error, 'Could not delete this file.');
  }
}

export async function deleteDocumentFiles(uri: string, thumbnailPath: string | null): Promise<void> {
  await deleteUri(uri);
  if (thumbnailPath) {
    await deleteUri(thumbnailPath);
  }
}

export async function readFileBase64(uri: string): Promise<string> {
  try {
    return await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
  } catch (error) {
    throw asAppError(error, 'Could not read this file.');
  }
}

export async function writeFileBase64(uri: string, base64: string): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(uri, base64, { encoding: 'base64' });
  } catch (error) {
    throw asAppError(error, 'Could not save this file.');
  }
}

async function listUrisIn(dir: string): Promise<string[]> {
  const entries = await FileSystem.readDirectoryAsync(dir);
  return entries.map((entry) => `${dir}${entry}`);
}

export async function listDocumentUris(): Promise<string[]> {
  try {
    await ensureSandboxDirs();
    return await listUrisIn(documentsDir());
  } catch (error) {
    throw asAppError(error, 'Could not list stored documents.');
  }
}

export async function listThumbnailUris(): Promise<string[]> {
  try {
    await ensureSandboxDirs();
    return await listUrisIn(thumbnailsDir());
  } catch (error) {
    throw asAppError(error, 'Could not list stored thumbnails.');
  }
}
