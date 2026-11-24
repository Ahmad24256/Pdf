import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { toUserMessage } from '../../core/errors';
import { useDocumentsStore } from '../../core/store/documentsStore';
import { generatePdfThumbnail } from '../../features/pdf/thumbnails';
import type { DocumentMeta } from '../../types/document';
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
          if (meta?.format === 'pdf') {
            try {
              const thumb = await generatePdfThumbnail(meta);
              await useDocumentsStore.getState().setThumbnail(meta.id, thumb);
            } catch {}
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
        { text: 'Delete', style: 'destructive', onPress: () => remove(doc.id) },
      ]);
    },
    [remove],
  );

  return (
    <View style={{ flex: 1, paddingTop: 56 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingBottom: 8,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: '700' }}>Documents</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={() => setSortMode((m) => (m === 'recent' ? 'name' : 'recent'))}
            style={{ paddingHorizontal: 10, paddingVertical: 8 }}
          >
            <Text style={{ color: '#0a7d6c', fontWeight: '600' }}>{sortMode === 'recent' ? 'Recent' : 'A-Z'}</Text>
          </Pressable>
          <Pressable
            onPress={handleImport}
            disabled={importing}
            style={{ backgroundColor: '#0a7d6c', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 }}
          >
            {importing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '600' }}>Import</Text>
            )}
          </Pressable>
        </View>
      </View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search documents"
        style={{
          marginHorizontal: 16,
          marginBottom: 8,
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 6,
        }}
      />
      {error ? (
        <ErrorBanner message={error} onDismiss={() => useDocumentsStore.setState({ error: null })} />
      ) : null}
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DocumentCard document={item} onPress={onOpen} onLongPress={handleDelete} />
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={{ marginTop: 32 }} />
          ) : query ? (
            <Text style={{ textAlign: 'center', marginTop: 32, color: '#555' }}>No documents match "{query}".</Text>
          ) : (
            <EmptyState />
          )
        }
      />
    </View>
  );
}
