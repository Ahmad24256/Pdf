import { Image, Pressable, Text, View } from 'react-native';
import type { DocumentFormat, DocumentMeta } from '../../types/document';
import { useTheme } from '../theme';

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
  const { colors, spacing, radius, fontSize } = useTheme();
  const color = FORMAT_COLORS[document.format];
  return (
    <Pressable
      onPress={() => onPress?.(document)}
      onLongPress={() => onLongPress?.(document)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing.md,
        marginTop: spacing.sm,
        padding: spacing.sm + 4,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
        opacity: pressed ? 0.7 : 1,
        borderWidth: 1,
        borderColor: colors.border,
      })}
    >
      {document.thumbnailPath ? (
        <Image
          source={{ uri: document.thumbnailPath }}
          style={{ width: 44, height: 56, borderRadius: radius.sm, backgroundColor: colors.chip }}
        />
      ) : (
        <View
          style={{
            width: 44,
            height: 56,
            borderRadius: radius.sm,
            backgroundColor: color,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '800' }}>{document.format.toUpperCase()}</Text>
        </View>
      )}
      <View style={{ flex: 1, marginLeft: spacing.sm + 4 }}>
        <Text style={{ fontSize: fontSize.body, fontWeight: '600', color: colors.text }} numberOfLines={1}>
          {document.name}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.caption, marginTop: 4 }}>
          {formatDate(document.lastModified)}
        </Text>
      </View>
      <View style={{ backgroundColor: color, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2 }}>
        <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: '700' }}>{document.format.toUpperCase()}</Text>
      </View>
    </Pressable>
  );
}
