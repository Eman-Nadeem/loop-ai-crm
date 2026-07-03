import crypto from "crypto";

const ENCRYPTION_KEY = process.env.OAUTH_ENCRYPTION_KEY || "temporary_fallback_key_32_bytes_long_minimum"; 
const IV_LENGTH = 16; // For AES-256-CBC

// Ensure key is exactly 32 bytes
function getSecretKey(): Buffer {
  // If the key is shorter, pad it; if longer, slice it
  const keyBuffer = Buffer.alloc(32);
  const sourceBuffer = Buffer.from(ENCRYPTION_KEY, "utf8");
  sourceBuffer.copy(keyBuffer, 0, 0, Math.min(sourceBuffer.length, 32));
  return keyBuffer;
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getSecretKey();
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

export function decrypt(text: string): string {
  const parts = text.split(":");
  if (parts.length !== 2) {
    throw new Error("Invalid encrypted text format");
  }
  const iv = Buffer.from(parts[0], "hex");
  const encryptedText = Buffer.from(parts[1], "hex");
  const key = getSecretKey();
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedText, undefined, "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
