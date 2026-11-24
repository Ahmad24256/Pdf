import { Pressable, Text, View } from 'react-native';

export default function ErrorBanner({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <View style={{ backgroundColor: '#b00020', paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ color: '#fff', flex: 1 }}>{message}</Text>
      {onDismiss ? (
        <Pressable onPress={onDismiss} hitSlop={8}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Dismiss</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
