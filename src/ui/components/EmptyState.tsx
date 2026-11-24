import { Text, View } from 'react-native';

export default function EmptyState() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>No documents yet</Text>
      <Text style={{ marginTop: 8, textAlign: 'center', color: '#555' }}>
        Tap Import to copy a PDF, DOCX, PPTX, or XLSX file into this app. Everything stays on your device.
      </Text>
    </View>
  );
}
