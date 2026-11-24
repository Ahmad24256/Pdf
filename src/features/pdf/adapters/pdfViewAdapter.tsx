import type { ComponentType } from 'react';

export interface PdfViewerProps {
  uri: string;
  onLoadComplete?: (pageCount: number) => void;
  onError?: (message: string) => void;
}

let cached: ComponentType<PdfViewerProps> | null | undefined;

function loadViewer(): ComponentType<PdfViewerProps> | null {
  if (cached !== undefined) return cached;
  try {
    const { PdfView } = require('react-native-pdf-jsi') as typeof import('react-native-pdf-jsi');
    const Viewer: ComponentType<PdfViewerProps> = ({ uri, onLoadComplete, onError }) => (
      <PdfView
        source={{ uri }}
        style={{ flex: 1 }}
        enableDoubleTapZoom
        onLoad={(event) => onLoadComplete?.(event.pageCount)}
        onError={(error) => onError?.(error.message || 'Could not open this PDF.')}
      />
    );
    cached = Viewer;
  } catch {
    cached = null;
  }
  return cached;
}

export function isPdfViewerAvailable(): boolean {
  return loadViewer() !== null;
}

export function getPdfViewer(): ComponentType<PdfViewerProps> | null {
  return loadViewer();
}
