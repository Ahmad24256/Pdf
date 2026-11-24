const files = new Map();
const dirs = new Set(['file:///sandbox/']);

export const documentDirectory = 'file:///sandbox/';

const norm = (uri) => (uri.startsWith('file://') ? uri : `file://${uri}`);

export function __seed(uri, content) {
  files.set(uri, content);
}

export function __reset() {
  files.clear();
  dirs.clear();
  dirs.add('file:///sandbox/');
}

export function __remove(uri) {
  files.delete(uri);
  dirs.delete(uri);
}

export async function getInfoAsync(uri) {
  const key = norm(uri);
  if (files.has(key)) return { exists: true, isDirectory: false, uri: key };
  if (dirs.has(key)) return { exists: true, isDirectory: true, uri: key };
  return { exists: false, isDirectory: false, uri: key };
}

export async function makeDirectoryAsync(uri, options = {}) {
  if (dirs.has(uri)) {
    if (options.intermediates) return;
    throw new Error(`Directory already exists: ${uri}`);
  }
  dirs.add(uri);
}

export async function copyAsync({ from, to }) {
  const src = norm(from);
  if (!files.has(src)) throw new Error(`Source does not exist: ${from}`);
  files.set(norm(to), files.get(src));
}

export async function deleteAsync(uri, options = {}) {
  const key = norm(uri);
  if (!files.has(key) && !dirs.has(key)) {
    if (options.idempotent) return;
    throw new Error(`File does not exist: ${uri}`);
  }
  files.delete(key);
  dirs.delete(key);
}

export async function readDirectoryAsync(dir) {
  if (!dirs.has(dir)) throw new Error(`Directory does not exist: ${dir}`);
  const names = new Set();
  for (const uri of [...files.keys(), ...dirs.keys()]) {
    if (uri.startsWith(dir)) {
      const rest = uri.slice(dir.length);
      if (rest && !rest.includes('/')) names.add(rest);
    }
  }
  return [...names];
}

export async function writeAsStringAsync(uri, data, options = {}) {
  files.set(uri, options.encoding === 'base64' ? Buffer.from(data, 'base64').toString('utf8') : data);
}

export async function readAsStringAsync(uri, options = {}) {
  const key = norm(uri);
  if (!files.has(key)) throw new Error(`File does not exist: ${uri}`);
  const content = files.get(key);
  return options.encoding === 'base64' ? Buffer.from(content, 'utf8').toString('base64') : content;
}
