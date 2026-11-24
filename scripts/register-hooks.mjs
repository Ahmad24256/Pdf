import { createRequire, register } from 'node:module';

register('./node-hooks.mjs', import.meta.url);

const realRequire = createRequire(import.meta.url);

const mocks = {
  'react-native-anydoc': await import('./anydoc.mock.mjs'),
  'react-native-pdf-jsi': await import('./pdf-jsi.mock.mjs'),
  '@doko/react-native-pdf-editor': await import('./doko-pdf-editor.mock.mjs'),
  'expo-sqlite': await import('./expo-sqlite.mock.mjs'),
  'expo-file-system': await import('./expo-file-system.mock.mjs'),
  'expo-file-system/legacy': await import('./expo-file-system.mock.mjs'),
};

globalThis.require = (name) => {
  if (name in mocks) return mocks[name];
  return realRequire(name);
};
