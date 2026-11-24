import { Image, Pressable, Text, View } from 'react-native';
import type { DocumentFormat, DocumentMeta } from '../../types/document';

const FORMAT_COLORS: Record<DocumentFormat, string> = {
  pdf: '#d32f2f',
  docx: '#1565c0',
  pptx: '#ef6c00',
  xlsx: '#2e7d32',
};

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export default function DocumentCard({
  document,
  onPress,
  onLongPress,
}: {
  document: DocumentMeta;
  onPress?: (doc: DocumentMeta) => void;
  onLongPress?: (doc: DocumentMeta) => void;
}) {
  const color = FORMAT_COLORS[document.format];
  return (
    <Pressable
      onPress={() => onPress?.(document)}
      onLongPress={() => onLongPress?.(document)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
      }}
    >
      {document.thumbnailPath ? (
        <Image source={{ uri: document.thumbnailPath }} style={{ width: 44, height: 56, borderRadius: 4 }} />
      ) : (
        <View
          style={{
            width: 44,
            height: 56,
            borderRadius: 4,
            backgroundColor: color,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{document.format.toUpperCase()}</Text>
        </View>
      )}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '600' }} numberOfLines={1}>
          {document.name}
        </Text>
        <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>{formatDate(document.lastModified)}</Text>
      </View>
      <View style={{ backgroundColor: color, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{document.format.toUpperCase()}</Text>
      </View>
    </Pressable>
  );
}
