import { AppError, asAppError } from '../../../core/errors';

export interface TextAnnotationInput {
  pageIndex: number;
  text: string;
  x: number;
  y: number;
  fontSize?: number;
}

export interface PdfPageInfo {
  pageCount: number;
  width: number;
  height: number;
}

type PdfEditorModule = typeof import('@doko/react-native-pdf-editor');

let cached: PdfEditorModule | null | undefined;

function loadModule(): PdfEditorModule | null {
  if (cached !== undefined) return cached;
  try {
    cached = require('@doko/react-native-pdf-editor') as PdfEditorModule;
  } catch {
    cached = null;
  }
  return cached;
}

export function isPdfEditorAvailable(): boolean {
  return loadModule() !== null;
}

export async function getPageInfo(filePath: string): Promise<PdfPageInfo> {
  const mod = loadModule();
  if (!mod) throw new AppError('The PDF editor engine is unavailable in this build.');
  try {
    const doc = await mod.PdfDocument.open(filePath);
    const page = doc.getPage(0);
    return { pageCount: doc.pageCount, width: page.width, height: page.height };
  } catch (error) {
    throw asAppError(error, 'Could not read this PDF.');
  }
}

export async function addTextAnnotation(filePath: string, annotation: TextAnnotationInput): Promise<void> {
  const mod = loadModule();
  if (!mod) throw new AppError('The PDF editor engine is unavailable in this build.');
  try {
    const doc = await mod.PdfDocument.open(filePath);
    const page = doc.getPage(annotation.pageIndex);
    const painter = page.createPainter();
    painter.setFont(doc.getStandard14Font('Helvetica'), annotation.fontSize ?? 16);
    painter.drawText(annotation.text, annotation.x, annotation.y);
    painter.finishDrawing();
    await doc.save(filePath);
  } catch (error) {
    throw asAppError(error, 'Could not save the changes to this PDF.');
  }
}
