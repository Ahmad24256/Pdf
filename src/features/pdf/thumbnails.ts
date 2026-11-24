import { AppError, asAppError } from '../../core/errors';
import { copyFile, deleteUri, uriToPath } from '../../core/fs/documentFiles';
import { thumbnailPath } from '../../core/fs/paths';
import type { DocumentMeta } from '../../types/document';

type PdfJsiModule = typeof import('react-native-pdf-jsi');

let cached: PdfJsiModule | null | undefined;

function loadModule(): PdfJsiModule | null {
  if (cached !== undefined) return cached;
  try {
    cached = require('react-native-pdf-jsi') as PdfJsiModule;
  } catch {
    cached = null;
  }
  return cached;
}

export function isPdfEngineAvailable(): boolean {
  return loadModule() !== null;
}

export async function generatePdfThumbnail(doc: DocumentMeta): Promise<string> {
  const mod = loadModule();
  if (!mod) {
    throw new AppError('The PDF engine is unavailable in this build.');
  }
  try {
    const imagePath = await mod.ExportManager.exportPageToImage(uriToPath(doc.uri), 0, {
      format: mod.ExportFormat.PNG,
      maxWidth: 176,
      maxHeight: 224,
    });
    const target = thumbnailPath(doc.id);
    await copyFile(imagePath, target);
    await deleteUri(imagePath.startsWith('file://') ? imagePath : `file://${imagePath}`).catch(() => undefined);
    return target;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw asAppError(error, 'Could not create a thumbnail for this PDF.');
  }
}
