import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { toUserMessage } from './core/errors';
import { ensureSandboxDirs } from './core/fs/paths';
import { reconcile } from './core/storage/documentsRepository';
import { useTheme } from './ui/theme';
import ErrorBanner from './ui/components/ErrorBanner';
import { useNavigation } from './ui/navigation';
import DocumentListScreen from './ui/screens/DocumentListScreen';
import DocumentScreen from './ui/screens/DocumentScreen';

export default function App() {
  const [bootError, setBootError] = useState<string | null>(null);
  const { screen, openDocument, goBack } = useNavigation();
  const { colors } = useTheme();

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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {screen.name === 'list' ? (
        <DocumentListScreen onOpen={openDocument} />
      ) : (
        <DocumentScreen doc={screen.doc} onBack={goBack} />
      )}
      {bootError ? <ErrorBanner message={bootError} onDismiss={() => setBootError(null)} /> : null}
      <StatusBar style={colors.background === '#0e1113' ? 'light' : 'dark'} />
    </View>
  );
}
