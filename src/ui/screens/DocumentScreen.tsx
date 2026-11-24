import type { DocumentMeta } from '../../types/document';
import DocxEditorScreen from '../../features/docx/DocxEditorScreen';
import PdfViewerScreen from '../../features/pdf/PdfViewerScreen';
import PptxViewerScreen from '../../features/pptx/PptxViewerScreen';
import XlsxViewerScreen from '../../features/xlsx/XlsxViewerScreen';
import EngineErrorBoundary from '../components/EngineErrorBoundary';

export default function DocumentScreen({ doc, onBack }: { doc: DocumentMeta; onBack: () => void }) {
  switch (doc.format) {
    case 'pdf':
      return (
        <EngineErrorBoundary title={doc.name} onBack={onBack}>
          <PdfViewerScreen doc={doc} onBack={onBack} />
        </EngineErrorBoundary>
      );
    case 'docx':
      return (
        <EngineErrorBoundary title={doc.name} onBack={onBack}>
          <DocxEditorScreen doc={doc} onBack={onBack} />
        </EngineErrorBoundary>
      );
    case 'pptx':
      return (
        <EngineErrorBoundary title={doc.name} onBack={onBack}>
          <PptxViewerScreen doc={doc} onBack={onBack} />
        </EngineErrorBoundary>
      );
    case 'xlsx':
      return (
        <EngineErrorBoundary title={doc.name} onBack={onBack}>
          <XlsxViewerScreen doc={doc} onBack={onBack} />
        </EngineErrorBoundary>
      );
  }
}
