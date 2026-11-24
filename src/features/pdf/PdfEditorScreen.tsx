import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { toUserMessage } from '../../core/errors';
import { uriToPath } from '../../core/fs/documentFiles';
import { successHaptic } from '../../core/haptics';
import { useDocumentsStore } from '../../core/store/documentsStore';
import type { DocumentMeta } from '../../types/document';
import { useTheme } from '../../ui/theme';
import EngineFallback from '../../ui/components/EngineFallback';
import ErrorBanner from '../../ui/components/ErrorBanner';
import ScreenHeader from '../../ui/components/ScreenHeader';
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
  const { colors, spacing, radius, fontSize } = useTheme();
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
      successHaptic();
      onSaved();
    } catch (e) {
      setError(toUserMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 56 }}>
      <ScreenHeader title="Edit PDF" subtitle={doc.name} onBack={onBack} />
      {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}
      <View style={{ padding: spacing.md }}>
        <Text style={{ marginBottom: spacing.sm, color: colors.textSecondary, fontSize: fontSize.body, lineHeight: 22 }}>
          Text is stamped on the first page, then saved into this app's storage.
        </Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Text to add to page 1"
          placeholderTextColor={colors.textSecondary}
          multiline
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            color: colors.text,
            borderRadius: radius.md,
            padding: 12,
            minHeight: 88,
            textAlignVertical: 'top',
            fontSize: fontSize.body,
          }}
        />
        <Pressable
          onPress={handleSave}
          disabled={busy || !text.trim()}
          style={{
            marginTop: spacing.md,
            backgroundColor: busy || !text.trim() ? colors.chip : colors.accent,
            paddingVertical: 12,
            borderRadius: radius.md,
            alignItems: 'center',
          }}
        >
          {busy ? (
            <ActivityIndicator color={colors.onAccent} />
          ) : (
            <Text style={{ color: colors.onAccent, fontWeight: '700', fontSize: fontSize.body }}>Save to device</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
