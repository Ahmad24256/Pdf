import * as FileSystem from 'expo-file-system/legacy';
import { AppError, asAppError } from '../errors';

function sandboxRoot(): string {
  const dir = FileSystem.documentDirectory;
  if (!dir) {
    throw new AppError('The app sandbox is not available on this device.');
  }
  return dir;
}

export function documentsDir(): string {
  return `${sandboxRoot()}documents/`;
}

export function thumbnailsDir(): string {
  return `${sandboxRoot()}thumbnails/`;
}

async function ensureDir(dir: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
}

export async function ensureSandboxDirs(): Promise<void> {
  try {
    await ensureDir(documentsDir());
    await ensureDir(thumbnailsDir());
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw asAppError(error, 'Could not prepare the local storage folder.');
  }
}
