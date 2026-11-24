import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { toUserMessage } from '../../core/errors';
import { deleteHaptic, successHaptic } from '../../core/haptics';
import { useDocumentsStore } from '../../core/store/documentsStore';
import { generatePdfThumbnail } from '../../features/pdf/thumbnails';
import type { DocumentMeta } from '../../types/document';
import { useTheme } from '../theme';
import DocumentCard from '../components/DocumentCard';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';

const PICKER_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

type SortMode = 'recent' | 'name';

export default function DocumentListScreen({ onOpen }: { onOpen?: (doc: DocumentMeta) => void }) {
  const documents = useDocumentsStore((s) => s.documents);
  const loading = useDocumentsStore((s) => s.loading);
  const error = useDocumentsStore((s) => s.error);
  const load = useDocumentsStore((s) => s.load);
  const add = useDocumentsStore((s) => s.add);
  const remove = useDocumentsStore((s) => s.remove);
  const [importing, setImporting] = useState(false);
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const { colors, spacing, radius, fontSize } = useTheme();

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? documents.filter((d) => d.name.toLowerCase().includes(q)) : documents;
    return [...filtered].sort((a, b) =>
      sortMode === 'name' ? a.name.localeCompare(b.name) : b.lastModified - a.lastModified,
    );
  }, [documents, query, sortMode]);

  const handleImport = useCallback(async () => {
    setImporting(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: PICKER_TYPES,
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        for (const asset of result.assets) {
          const meta = await add(asset.uri, asset.name ?? 'document');
          if (meta) {
            successHaptic();
            if (meta.format === 'pdf') {
              try {
                const thumb = await generatePdfThumbnail(meta);
                await useDocumentsStore.getState().setThumbnail(meta.id, thumb);
              } catch {}
            }
          }
        }
      }
    } catch (e) {
      useDocumentsStore.setState({ error: toUserMessage(e) });
    } finally {
      setImporting(false);
    }
  }, [add]);

  const handleDelete = useCallback(
    (doc: DocumentMeta) => {
      Alert.alert('Delete document?', `"${doc.name}" and its stored copy will be removed from this device.`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteHaptic();
            remove(doc.id);
          },
        },
      ]);
    },
    [remove],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 56 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.sm,
        }}
      >
        <Text style={{ fontSize: fontSize.title, fontWeight: '800', color: colors.text }}>Documents</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={() => setSortMode((m) => (m === 'recent' ? 'name' : 'recent'))}
            style={{
              backgroundColor: colors.chip,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: radius.md,
              marginRight: spacing.sm,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: fontSize.caption }}>
              {sortMode === 'recent' ? 'RECENT' : 'A-Z'}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleImport}
            disabled={importing}
            style={{
              backgroundColor: colors.accent,
              paddingHorizontal: 16,
              paddingVertical: 9,
              borderRadius: radius.md,
              opacity: importing ? 0.6 : 1,
            }}
          >
            {importing ? (
              <ActivityIndicator color={colors.onAccent} />
            ) : (
              <Text style={{ color: colors.onAccent, fontWeight: '700', fontSize: fontSize.body }}>Import</Text>
            )}
          </Pressable>
        </View>
      </View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search documents"
        placeholderTextColor={colors.textSecondary}
        style={{
          marginHorizontal: spacing.md,
          marginBottom: spacing.sm,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          color: colors.text,
          borderRadius: radius.md,
          paddingHorizontal: 12,
          paddingVertical: 9,
          fontSize: fontSize.body,
        }}
      />
      {error ? (
        <ErrorBanner message={error} onDismiss={() => useDocumentsStore.setState({ error: null })} />
      ) : null}
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DocumentCard document={item} onPress={onOpen} onLongPress={handleDelete} />}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: spacing.lg }}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={{ marginTop: 48 }} color={colors.accent} />
          ) : query ? (
            <Text style={{ textAlign: 'center', marginTop: 48, color: colors.textSecondary }}>
              No documents match "{query}".
            </Text>
          ) : (
            <EmptyState />
          )
        }
      />
    </View>
  );
}
