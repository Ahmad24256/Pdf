import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { toUserMessage } from '../../core/errors';
import { useDocumentsStore } from '../../core/store/documentsStore';
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

export default function DocumentListScreen({ onOpen }: { onOpen?: (doc: DocumentMeta) => void }) {
  const documents = useDocumentsStore((s) => s.documents);
  const loading = useDocumentsStore((s) => s.loading);
  const error = useDocumentsStore((s) => s.error);
  const load = useDocumentsStore((s) => s.load);
  const add = useDocumentsStore((s) => s.add);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

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
          await add(asset.uri, asset.name ?? 'document');
        }
      }
    } catch (e) {
      useDocumentsStore.setState({ error: toUserMessage(e) });
    } finally {
      setImporting(false);
    }
  }, [add]);

  return (
    <View style={{ flex: 1, paddingTop: 56 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingBottom: 12,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: '700' }}>Documents</Text>
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
      {error ? (
        <ErrorBanner message={error} onDismiss={() => useDocumentsStore.setState({ error: null })} />
      ) : null}
      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DocumentCard document={item} onPress={onOpen} />}
        ListEmptyComponent={loading ? <ActivityIndicator style={{ marginTop: 32 }} /> : <EmptyState />}
      />
    </View>
  );
}
