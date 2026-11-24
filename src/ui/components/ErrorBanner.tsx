import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme';

export default function ErrorBanner({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  const { colors, fontSize } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.danger,
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: '#ffffff', flex: 1, fontSize: fontSize.body }}>{message}</Text>
      {onDismiss ? (
        <Pressable onPress={onDismiss} hitSlop={8}>
          <Text style={{ color: '#ffffff', fontWeight: '700' }}>Dismiss</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
