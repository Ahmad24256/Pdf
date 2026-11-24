export async function convertDocumentToIr(bytes) {
  const head = Buffer.from(bytes.slice(0, 2)).toString('latin1');
  if (head === 'PK') {
    return { status: 'ok', ir: { kind: 'presentation', pages: [{ index: 0 }] }, assets: [], warnings: [] };
  }
  return { status: 'fallback', reason: 'parse-error', detail: 'not a zip container' };
}
