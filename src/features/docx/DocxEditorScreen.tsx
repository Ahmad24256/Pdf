import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import type { DraftStorageAdapter } from '@shashimadushan/docx-editor-react-native';
import { toUserMessage } from '../../core/errors';
import { readFileBase64, writeFileBase64 } from '../../core/fs/documentFiles';
import { successHaptic } from '../../core/haptics';
import { useDocumentsStore } from '../../core/store/documentsStore';
import type { DocumentMeta } from '../../types/document';
import { useTheme } from '../../ui/theme';
import EngineFallback from '../../ui/components/EngineFallback';
import ErrorBanner from '../../ui/components/ErrorBanner';
import ScreenHeader from '../../ui/components/ScreenHeader';
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
  const { colors, radius, fontSize } = useTheme();

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
      successHaptic();
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
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 56 }}>
      <ScreenHeader
        title={doc.name}
        onBack={onBack}
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {dirty ? (
              <Text style={{ color: colors.accent, fontSize: fontSize.caption, marginRight: 8, fontWeight: '600' }}>
                Unsaved
              </Text>
            ) : null}
            <Pressable
              onPress={handleSave}
              disabled={busy || !ready}
              style={{
                backgroundColor: busy || !ready ? colors.chip : colors.accent,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: radius.sm,
              }}
            >
              {busy ? (
                <ActivityIndicator color={colors.onAccent} />
              ) : (
                <Text style={{ color: colors.onAccent, fontWeight: '700', fontSize: fontSize.caption }}>SAVE</Text>
              )}
            </Pressable>
          </View>
        }
      />
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
