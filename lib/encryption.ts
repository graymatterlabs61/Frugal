import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  type CipherGCM,
  type DecipherGCM,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;   // 96-bit IV recommended for GCM
const TAG_BYTES = 16;  // 128-bit auth tag

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw || raw.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY must be a 64-character hex string (32 bytes). " +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  return Buffer.from(raw, "hex");
}

/**
 * Encrypt a plaintext string.
 * Returns a colon-delimited string: <iv:hex>:<ciphertext:base64>:<authTag:hex>
 * Safe to store in a database column.
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv) as CipherGCM;

  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${encrypted}:${authTag.toString("hex")}`;
}

/**
 * Decrypt a string produced by encrypt().
 * Throws if the auth tag does not match (tampered data).
 */
export function decrypt(encryptedData: string): string {
  const parts = encryptedData.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted data format");
  }

  const [ivHex, ciphertext, authTagHex] = parts;
  const key = getKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  if (iv.length !== IV_BYTES) throw new Error("Invalid IV length");
  if (authTag.length !== TAG_BYTES) throw new Error("Invalid auth tag length");

  const decipher = createDecipheriv(ALGORITHM, key, iv) as DecipherGCM;
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/** Mask an API key for display: sk-...xxxx */
export function maskApiKey(plaintext: string): string {
  if (plaintext.length <= 8) return "••••••••";
  const prefix = plaintext.slice(0, 4);
  const suffix = plaintext.slice(-4);
  return `${prefix}${"•".repeat(Math.min(12, plaintext.length - 8))}${suffix}`;
}
