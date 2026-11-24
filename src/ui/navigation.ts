import { useCallback, useState } from 'react';
import type { DocumentMeta } from '../types/document';

export type Screen = { name: 'list' } | { name: 'viewer'; doc: DocumentMeta };

export function useNavigation() {
  const [screen, setScreen] = useState<Screen>({ name: 'list' });
  const openDocument = useCallback((doc: DocumentMeta) => setScreen({ name: 'viewer', doc }), []);
  const goBack = useCallback(() => setScreen({ name: 'list' }), []);
  return { screen, openDocument, goBack };
}
