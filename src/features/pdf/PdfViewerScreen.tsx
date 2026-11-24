import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { DocumentMeta } from '../../types/document';
import EngineFallback from '../../ui/components/EngineFallback';
import ErrorBanner from '../../ui/components/ErrorBanner';
import { getPdfViewer } from './adapters/pdfViewAdapter';

export default function PdfViewerScreen({ doc, onBack }: { doc: DocumentMeta; onBack: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const Viewer = getPdfViewer();

  if (!Viewer) {
    return (
      <EngineFallback
        title={doc.name}
        message="The PDF viewer engine is unavailable in this build. The file stays safely stored on your device."
        onBack={onBack}
      />
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: 56 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 }}>
        <Pressable onPress={onBack} hitSlop={8}>
          <Text style={{ color: '#0a7d6c', fontWeight: '600' }}>Back</Text>
        </Pressable>
        <Text style={{ flex: 1, marginLeft: 12, fontWeight: '700' }} numberOfLines={1}>
          {doc.name}
        </Text>
        {pageCount !== null ? <Text style={{ color: '#666' }}>{pageCount} pages</Text> : null}
      </View>
      {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}
      <Viewer uri={doc.uri} onLoadComplete={setPageCount} onError={setError} />
    </View>
  );
}
