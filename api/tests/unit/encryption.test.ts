import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, constantTimeEqual, extractSuffix } from '@/utils/encryption';

describe('encryption', () => {
  it('roundtrips plaintext', () => {
    const plain = 'sk-test-api-key-1234567890';
    const encrypted = encrypt(plain);
    expect(decrypt(encrypted)).toBe(plain);
  });

  it('produces unique ciphertext per encryption', () => {
    const plain = 'same-key';
    expect(encrypt(plain)).not.toBe(encrypt(plain));
  });

  it('detects tampered ciphertext', () => {
    const encrypted = encrypt('secret');
    const parts = encrypted.split(':');
    parts[1] = Buffer.from('tampered').toString('base64');
    expect(() => decrypt(parts.join(':'))).toThrow();
  });

  it('constantTimeEqual returns true for identical strings', () => {
    expect(constantTimeEqual('abc', 'abc')).toBe(true);
  });

  it('constantTimeEqual returns false for different strings', () => {
    expect(constantTimeEqual('abc', 'xyz')).toBe(false);
  });

  it('constantTimeEqual returns false for different lengths', () => {
    expect(constantTimeEqual('abc', 'abcd')).toBe(false);
  });

  it('extractSuffix returns last 4 chars', () => {
    expect(extractSuffix('sk-test-abc1234')).toBe('1234');
  });
});