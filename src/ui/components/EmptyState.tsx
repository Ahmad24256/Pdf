import { Text, View } from 'react-native';
import { useTheme } from '../theme';

export default function EmptyState() {
  const { colors, spacing, fontSize } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: 44,
          backgroundColor: colors.chip,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 30, fontWeight: '800', color: colors.accent }}>D</Text>
      </View>
      <Text style={{ fontSize: fontSize.header, fontWeight: '700', color: colors.text }}>No documents yet</Text>
      <Text
        style={{
          marginTop: spacing.sm,
          textAlign: 'center',
          color: colors.textSecondary,
          fontSize: fontSize.body,
          lineHeight: 22,
        }}
      >
        Tap Import to copy a PDF, DOCX, PPTX, or XLSX file into this app. Everything stays on your device.
      </Text>
    </View>
  );
}
