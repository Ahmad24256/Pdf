import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { toUserMessage } from './core/errors';
import { ensureSandboxDirs } from './core/fs/paths';
import { reconcile } from './core/storage/documentsRepository';
import ErrorBanner from './ui/components/ErrorBanner';
import DocumentListScreen from './ui/screens/DocumentListScreen';

export default function App() {
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await ensureSandboxDirs();
        await reconcile();
      } catch (error) {
        setBootError(toUserMessage(error));
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <DocumentListScreen />
      {bootError ? <ErrorBanner message={bootError} onDismiss={() => setBootError(null)} /> : null}
      <StatusBar style="auto" />
    </View>
  );
}
