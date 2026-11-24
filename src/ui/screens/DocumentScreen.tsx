import { Pressable, Text, View } from 'react-native';
import type { DocumentFormat, DocumentMeta } from '../../types/document';
import PdfViewerScreen from '../../features/pdf/PdfViewerScreen';
import DocxEditorScreen from '../../features/docx/DocxEditorScreen';
import PptxViewerScreen from '../../features/pptx/PptxViewerScreen';

function FormatStub({ format, doc, onBack }: { format: DocumentFormat; doc: DocumentMeta; onBack: () => void }) {
  return (
    <View style={{ flex: 1, paddingTop: 56 }}>
      <Pressable onPress={onBack} hitSlop={8} style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        <Text style={{ color: '#0a7d6c', fontWeight: '600' }}>Back</Text>
      </Pressable>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '700' }} numberOfLines={2}>
          {doc.name}
        </Text>
        <Text style={{ marginTop: 8, color: '#555' }}>
          {format.toUpperCase()} viewer is not wired up yet.
        </Text>
      </View>
    </View>
  );
}

export default function DocumentScreen({ doc, onBack }: { doc: DocumentMeta; onBack: () => void }) {
  switch (doc.format) {
    case 'pdf':
      return <PdfViewerScreen doc={doc} onBack={onBack} />;
    case 'docx':
      return <DocxEditorScreen doc={doc} onBack={onBack} />;
    case 'pptx':
      return <PptxViewerScreen doc={doc} onBack={onBack} />;
    case 'xlsx':
      return <FormatStub format="xlsx" doc={doc} onBack={onBack} />;
  }
}
