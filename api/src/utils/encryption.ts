import { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from 'crypto';
import { config } from '@/config/unifiedConfig';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;   // 96-bit IV for GCM
const TAG_LENGTH = 16;

function getKey(): Buffer {
  return Buffer.from(config.encryption.key, 'hex');
}

export function encrypt(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const key = getKey();
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Format: hex(iv):base64(ciphertext):hex(authTag)
  return `${iv.toString('hex')}:${encrypted.toString('base64')}:${authTag.toString('hex')}`;
}

export function decrypt(encoded: string): string {
  const parts = encoded.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted format');

  const [ivHex, ciphertextB64, authTagHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const ciphertext = Buffer.from(ciphertextB64, 'base64');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = getKey();

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

export function constantTimeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export function extractSuffix(apiKey: string): string {
  return apiKey.slice(-4);
}