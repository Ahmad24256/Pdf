export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'expo-sqlite') {
    return { url: new URL('./expo-sqlite.mock.mjs', import.meta.url).href, shortCircuit: true };
  }
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if ((specifier.startsWith('./') || specifier.startsWith('../')) && context.parentURL) {
      return { url: new URL(`${specifier}.ts`, context.parentURL).href, shortCircuit: true };
    }
    throw error;
  }
}
