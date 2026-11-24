import { Pressable, Text, View } from 'react-native';
import type { DocumentMeta } from '../../types/document';

export default function DocumentCard({
  document,
  onPress,
}: {
  document: DocumentMeta;
  onPress?: (doc: DocumentMeta) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress?.(document)}
      style={{ paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}
    >
      <Text style={{ fontSize: 16, fontWeight: '600' }} numberOfLines={1}>
        {document.name}
      </Text>
      <View style={{ flexDirection: 'row', marginTop: 4 }}>
        <Text style={{ color: '#666', fontSize: 12, fontWeight: '700' }}>{document.format.toUpperCase()}</Text>
      </View>
    </Pressable>
  );
}
