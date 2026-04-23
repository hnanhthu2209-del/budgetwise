// Use expo-crypto for secure UUID generation on native.
// Falls back to Math.random for environments where the native module
// isn't available (e.g. plain Jest, web without polyfill).
import * as Crypto from 'expo-crypto';

export function newId(): string {
  try {
    return Crypto.randomUUID();
  } catch {
    // Fallback: RFC4122 v4 UUID via Math.random
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
}
