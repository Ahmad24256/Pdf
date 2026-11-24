import { AppError, asAppError } from '../errors';
import { readFileBase64 } from '../fs/documentFiles';

export type ConvertOutcome =
  | { ok: true; ir: unknown; warnings: string[] }
  | { ok: false; reason: string; detail: string };

type AnydocModule = typeof import('react-native-anydoc');

let cached: AnydocModule | null | undefined;

function loadModule(): AnydocModule | null {
  if (cached !== undefined) return cached;
  try {
    cached = require('react-native-anydoc') as AnydocModule;
  } catch {
    cached = null;
  }
  return cached;
}

export function isAnydocAvailable(): boolean {
  return loadModule() !== null;
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function convertFileToIr(uri: string): Promise<ConvertOutcome> {
  const mod = loadModule();
  if (!mod) {
    throw new AppError('The document converter is unavailable in this build.');
  }
  try {
    const base64 = await readFileBase64(uri);
    const result = await mod.convertDocumentToIr(base64ToBytes(base64));
    if (result.status === 'ok') {
      return { ok: true, ir: result.ir, warnings: result.warnings };
    }
    return { ok: false, reason: result.reason, detail: result.detail };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw asAppError(error, 'Could not read this file.');
  }
}
