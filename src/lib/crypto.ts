import crypto from 'crypto';

// AES-256-GCM encryption helper for secrets at rest.
// Requires TOKEN_ENCRYPTION_KEY to be a 32-byte key encoded as hex (64 chars).

const ALG = 'aes-256-gcm';

function getKey(): Buffer {
  const hex = process.env.TOKEN_ENCRYPTION_KEY;
  if (!hex) {
    throw new Error('Missing TOKEN_ENCRYPTION_KEY (hex-encoded 32 bytes)');
  }
  const key = Buffer.from(hex, 'hex');
  if (key.length !== 32) throw new Error('TOKEN_ENCRYPTION_KEY must be 32 bytes (64 hex chars)');
  return key;
}

export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALG, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Store as base64(iv).base64(tag).base64(ciphertext)
  return `${iv.toString('base64')}.${tag.toString('base64')}.${ciphertext.toString('base64')}`;
}

export function decryptSecret(enc: string): string {
  const [ivB64, tagB64, dataB64] = enc.split('.');
  if (!ivB64 || !tagB64 || !dataB64) throw new Error('Invalid encrypted secret format');
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');

  const key = getKey();
  const decipher = crypto.createDecipheriv(ALG, key, iv);
  decipher.setAuthTag(tag);

  const plain = Buffer.concat([decipher.update(data), decipher.final()]);
  return plain.toString('utf8');
}
