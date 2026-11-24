import type { ComponentType, RefObject } from 'react';
import type { DocxEditorViewProps } from '@shashimadushan/docx-editor-react-native';

type DocxEditorModule = typeof import('@shashimadushan/docx-editor-react-native');

let cached: DocxEditorModule | null | undefined;

function loadModule(): DocxEditorModule | null {
  if (cached !== undefined) return cached;
  try {
    cached = require('@shashimadushan/docx-editor-react-native') as DocxEditorModule;
  } catch {
    cached = null;
  }
  return cached;
}

export function isDocxEditorAvailable(): boolean {
  return loadModule() !== null;
}

export const DocxEditorView: ComponentType<DocxEditorViewProps> = (props) => {
  const mod = loadModule();
  if (!mod) return null;
  return <mod.DocxEditorView {...props} />;
};

export function useDocxEditorHandle(): RefObject<ReturnType<DocxEditorModule['useDocxEditorHandle']>['current']> | null {
  const mod = loadModule();
  if (!mod) return null;
  return mod.useDocxEditorHandle();
}
