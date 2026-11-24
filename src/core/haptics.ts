type HapticsModule = typeof import('expo-haptics');

let cached: HapticsModule | null | undefined;

function loadModule(): HapticsModule | null {
  if (cached !== undefined) return cached;
  try {
    cached = require('expo-haptics') as HapticsModule;
  } catch {
    cached = null;
  }
  return cached;
}

export async function successHaptic(): Promise<void> {
  try {
    const mod = loadModule();
    await mod?.notificationAsync(mod.NotificationFeedbackType.Success);
  } catch {}
}

export async function deleteHaptic(): Promise<void> {
  try {
    const mod = loadModule();
    await mod?.impactAsync(mod.ImpactFeedbackStyle.Medium);
  } catch {}
}
