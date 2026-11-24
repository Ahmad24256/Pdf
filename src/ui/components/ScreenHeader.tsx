import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';

export default function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const { colors, fontSize } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
        backgroundColor: colors.surface,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
      }}
    >
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={8}>
          <Text style={{ color: colors.accent, fontWeight: '600', fontSize: fontSize.body }}>Back</Text>
        </Pressable>
      ) : null}
      <View style={{ flex: 1, marginLeft: onBack ? 12 : 0 }}>
        <Text numberOfLines={1} style={{ color: colors.text, fontSize: fontSize.header, fontWeight: '700' }}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={{ color: colors.textSecondary, fontSize: fontSize.caption, marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}
