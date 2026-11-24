import { Text, View } from 'react-native';
import { useTheme } from '../theme';
import ScreenHeader from './ScreenHeader';

export default function EngineFallback({
  title,
  message,
  onBack,
}: {
  title: string;
  message: string;
  onBack?: () => void;
}) {
  const { colors, spacing, fontSize } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 56 }}>
      <ScreenHeader title={title} onBack={onBack} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
        <Text style={{ fontSize: fontSize.header, fontWeight: '700', color: colors.text, textAlign: 'center' }} numberOfLines={2}>
          {title}
        </Text>
        <Text style={{ marginTop: spacing.sm, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 }}>
          {message}
        </Text>
      </View>
    </View>
  );
}
