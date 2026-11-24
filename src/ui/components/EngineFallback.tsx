import { Pressable, Text, View } from 'react-native';

export default function EngineFallback({
  title,
  message,
  onBack,
}: {
  title: string;
  message: string;
  onBack?: () => void;
}) {
  return (
    <View style={{ flex: 1, paddingTop: 56 }}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={8} style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
          <Text style={{ color: '#0a7d6c', fontWeight: '600' }}>Back</Text>
        </Pressable>
      ) : null}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', textAlign: 'center' }} numberOfLines={2}>
          {title}
        </Text>
        <Text style={{ marginTop: 8, color: '#555', textAlign: 'center' }}>{message}</Text>
      </View>
    </View>
  );
}
