import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '../../src/utils/encryption.js';

describe('encryption (AES-256-GCM)', () => {
  it('round-trips plaintext', () => {
    const secret = 'sk-proj-abcdef1234567890';
    expect(decrypt(encrypt(secret))).toBe(secret);
  });

  it('produces iv:ciphertext:authTag in hex:base64:hex', () => {
    const parts = encrypt('hello').split(':');
    expect(parts).toHaveLength(3);
    expect(parts[0]).toMatch(/^[0-9a-f]{24}$/); // 12-byte IV hex
    expect(parts[2]).toMatch(/^[0-9a-f]{32}$/); // 16-byte auth tag hex
    expect(() => Buffer.from(parts[1]!, 'base64')).not.toThrow();
  });

  it('uses a fresh IV every call', () => {
    expect(encrypt('same')).not.toBe(encrypt('same'));
  });

  it('detects ciphertext tampering', () => {
    const payload = encrypt('sensitive');
    const [iv, ct, tag] = payload.split(':') as [string, string, string];
    const flipped = Buffer.from(ct, 'base64');
    flipped[0] = flipped[0]! ^ 0xff;
    const tampered = `${iv}:${flipped.toString('base64')}:${tag}`;
    expect(() => decrypt(tampered)).toThrow('Decryption failed');
  });

  it('rejects malformed payloads', () => {
    expect(() => decrypt('not-a-valid-payload')).toThrow('Decryption failed');
  });
});
