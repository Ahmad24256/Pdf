import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { toUserMessage } from '../../core/errors';
import { uriToPath } from '../../core/fs/documentFiles';
import { useDocumentsStore } from '../../core/store/documentsStore';
import type { DocumentMeta } from '../../types/document';
import EngineFallback from '../../ui/components/EngineFallback';
import ErrorBanner from '../../ui/components/ErrorBanner';
import { addTextAnnotation, getPageInfo, isPdfEditorAvailable } from './adapters/pdfEditAdapter';

export default function PdfEditorScreen({
  doc,
  onBack,
  onSaved,
}: {
  doc: DocumentMeta;
  onBack: () => void;
  onSaved: () => void;
}) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const available = isPdfEditorAvailable();

  useEffect(() => {
    if (available) {
      getPageInfo(uriToPath(doc.uri)).catch((e) => setError(toUserMessage(e)));
    }
  }, [available, doc.uri]);

  if (!available) {
    return (
      <EngineFallback
        title={doc.name}
        message="The PDF editor engine is unavailable in this build, so this file opens read-only."
        onBack={onBack}
      />
    );
  }

  const handleSave = async () => {
    const value = text.trim();
    if (!value || busy) return;
    setBusy(true);
    setError(null);
    try {
      const info = await getPageInfo(uriToPath(doc.uri));
      await addTextAnnotation(uriToPath(doc.uri), {
        pageIndex: 0,
        text: value,
        x: 50,
        y: Math.max(50, info.height - 50),
        fontSize: 16,
      });
      await useDocumentsStore.getState().touch(doc.id);
      onSaved();
    } catch (e) {
      setError(toUserMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, paddingTop: 56 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 }}>
        <Pressable onPress={onBack} hitSlop={8}>
          <Text style={{ color: '#0a7d6c', fontWeight: '600' }}>Back</Text>
        </Pressable>
        <Text style={{ flex: 1, marginLeft: 12, fontSize: 18, fontWeight: '700' }} numberOfLines={1}>
          Edit {doc.name}
        </Text>
      </View>
      {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}
      <View style={{ padding: 16 }}>
        <Text style={{ marginBottom: 8, color: '#555' }}>Text is stamped on the first page, then saved into this app's storage.</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Text to add to page 1"
          multiline
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            padding: 10,
            minHeight: 80,
            textAlignVertical: 'top',
          }}
        />
        <Pressable
          onPress={handleSave}
          disabled={busy || !text.trim()}
          style={{
            marginTop: 12,
            backgroundColor: busy || !text.trim() ? '#9db8b3' : '#0a7d6c',
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Save to device</Text>}
        </Pressable>
      </View>
    </View>
  );
}
