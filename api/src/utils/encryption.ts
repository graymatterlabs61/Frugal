import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { config } from '../config/unifiedConfig.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // NIST-recommended for GCM

function key(): Buffer {
  return Buffer.from(config.encryption.key, 'hex');
}

/** Returns `iv(hex):ciphertext(base64):authTag(hex)` per spec §8. */
export function encrypt(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${ciphertext.toString('base64')}:${authTag.toString('hex')}`;
}

export function decrypt(payload: string): string {
  try {
    const parts = payload.split(':');
    if (parts.length !== 3) throw new Error('bad format');
    const [ivHex, ctB64, tagHex] = parts as [string, string, string];
    const decipher = createDecipheriv(ALGORITHM, key(), Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(ctB64, 'base64')),
      decipher.final(),
    ]);
    return plaintext.toString('utf8');
  } catch {
    throw new Error('Decryption failed');
  }
}
