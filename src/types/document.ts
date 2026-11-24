export type DocumentFormat = 'pdf' | 'docx' | 'pptx' | 'xlsx';

export interface DocumentMeta {
  id: string;
  name: string;
  uri: string;
  format: DocumentFormat;
  lastModified: number;
  thumbnailPath: string | null;
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export const SUPPORTED_FORMATS: readonly DocumentFormat[] = ['pdf', 'docx', 'pptx', 'xlsx'];

const EXTENSION_TO_FORMAT: Record<string, DocumentFormat> = {
  pdf: 'pdf',
  docx: 'docx',
  pptx: 'pptx',
  xlsx: 'xlsx',
};

export function formatFromFileName(name: string): DocumentFormat | null {
  const dot = name.lastIndexOf('.');
  if (dot < 0) return null;
  return EXTENSION_TO_FORMAT[name.slice(dot + 1).toLowerCase()] ?? null;
}
