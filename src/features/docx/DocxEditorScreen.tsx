import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import type { DraftStorageAdapter } from '@shashimadushan/docx-editor-react-native';
import { toUserMessage } from '../../core/errors';
import { readFileBase64, writeFileBase64 } from '../../core/fs/documentFiles';
import { useDocumentsStore } from '../../core/store/documentsStore';
import type { DocumentMeta } from '../../types/document';
import EngineFallback from '../../ui/components/EngineFallback';
import ErrorBanner from '../../ui/components/ErrorBanner';
import { DocxEditorView, isDocxEditorAvailable, useDocxEditorHandle } from './adapters/docxAdapter';

export default function DocxEditorScreen({ doc, onBack }: { doc: DocumentMeta; onBack: () => void }) {
  if (!isDocxEditorAvailable()) {
    return (
      <EngineFallback
        title={doc.name}
        message="The DOCX editor engine is unavailable in this build."
        onBack={onBack}
      />
    );
  }
  return <DocxEditorInner doc={doc} onBack={onBack} />;
}

function DocxEditorInner({ doc, onBack }: { doc: DocumentMeta; onBack: () => void }) {
  const handle = useDocxEditorHandle();
  const [ready, setReady] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback(
    async (base64: string) => {
      await writeFileBase64(doc.uri, base64);
      await useDocumentsStore.getState().touch(doc.id);
    },
    [doc.uri, doc.id],
  );

  const onReady = useCallback(async () => {
    setReady(true);
    try {
      const base64 = await readFileBase64(doc.uri);
      await handle?.current?.loadDocx(base64);
    } catch (e) {
      setError(toUserMessage(e));
    }
  }, [doc.uri, handle]);

  const handleSave = useCallback(async () => {
    if (!handle?.current || busy) return;
    setBusy(true);
    setError(null);
    try {
      const base64 = await handle.current.saveDocx();
      await persist(base64);
      setDirty(false);
    } catch (e) {
      setError(toUserMessage(e));
    } finally {
      setBusy(false);
    }
  }, [handle, busy, persist]);

  const autosaveStorage = useMemo<DraftStorageAdapter>(
    () => ({
      saveDraft: (_key, base64) => persist(base64),
      loadDraft: async () => null,
      listDrafts: async () => [],
      deleteDraft: async () => undefined,
    }),
    [persist],
  );

  return (
    <View style={{ flex: 1, paddingTop: 56 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 }}>
        <Pressable onPress={onBack} hitSlop={8}>
          <Text style={{ color: '#0a7d6c', fontWeight: '600' }}>Back</Text>
        </Pressable>
        <Text style={{ flex: 1, marginLeft: 12, fontWeight: '700' }} numberOfLines={1}>
          {doc.name}
        </Text>
        {dirty ? <Text style={{ color: '#ef6c00', fontSize: 12, marginRight: 8 }}>Unsaved</Text> : null}
        <Pressable
          onPress={handleSave}
          disabled={busy || !ready}
          style={{ backgroundColor: busy || !ready ? '#9db8b3' : '#0a7d6c', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
        >
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>}
        </Pressable>
      </View>
      {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}
      <View style={{ flex: 1 }}>
        <DocxEditorView
          fileName={doc.name}
          onReady={onReady}
          onDirtyChange={setDirty}
          onError={(message) => setError(message)}
          autosave={{ storage: autosaveStorage, key: doc.id, intervalMs: 3000, onError: (e) => setError(toUserMessage(e)) }}
        />
      </View>
    </View>
  );
}
