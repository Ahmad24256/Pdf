import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { DocumentMeta } from '../../types/document';
import { useTheme } from '../../ui/theme';
import EngineFallback from '../../ui/components/EngineFallback';
import ErrorBanner from '../../ui/components/ErrorBanner';
import ScreenHeader from '../../ui/components/ScreenHeader';
import { getPdfViewer } from './adapters/pdfViewAdapter';
import PdfEditorScreen from './PdfEditorScreen';

export default function PdfViewerScreen({ doc, onBack }: { doc: DocumentMeta; onBack: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const { colors, radius, fontSize } = useTheme();
  const Viewer = getPdfViewer();

  if (editing) {
    return <PdfEditorScreen doc={doc} onBack={() => setEditing(false)} onSaved={() => setEditing(false)} />;
  }

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
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 56 }}>
      <ScreenHeader
        title={doc.name}
        subtitle={pageCount !== null ? `${pageCount} pages` : undefined}
        onBack={onBack}
        right={
          <Pressable
            onPress={() => setEditing(true)}
            style={{ backgroundColor: colors.accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.sm }}
          >
            <Text style={{ color: colors.onAccent, fontWeight: '700', fontSize: fontSize.caption }}>EDIT</Text>
          </Pressable>
        }
      />
      {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}
      <Viewer uri={doc.uri} onLoadComplete={setPageCount} onError={setError} />
    </View>
  );
}
