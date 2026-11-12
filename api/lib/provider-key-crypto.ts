import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

type KeyIdentity = { userId: number; provider: string };

export class LegacyProviderKeyError extends Error {
  constructor() {
    super("Please re-enter your provider API key in Settings.");
  }
}

function encryptionKey(): Buffer {
  const encoded = process.env.API_KEY_ENCRYPTION_KEY;
  if (!encoded || !/^[A-Za-z0-9+/]{43}=$/.test(encoded)) {
    throw new Error("API_KEY_ENCRYPTION_KEY must be a base64-encoded 32-byte key");
  }
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32 || key.toString("base64") !== encoded) {
    throw new Error("API_KEY_ENCRYPTION_KEY must be a base64-encoded 32-byte key");
  }
  return key;
}

function associatedData(identity: KeyIdentity): Buffer {
  return Buffer.from(JSON.stringify([identity.userId, identity.provider]), "utf8");
}

export function encryptProviderKey(value: string, identity: KeyIdentity): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  cipher.setAAD(associatedData(identity));
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), ciphertext.toString("base64url")].join(".");
}

export function decryptProviderKey(value: string, identity: KeyIdentity): string {
  if (!value.startsWith("v1.")) throw new LegacyProviderKeyError();
  const parts = value.split(".");
  if (parts.length !== 4 || parts.slice(1).some(part => !/^[A-Za-z0-9_-]+$/.test(part))) {
    throw new Error("Invalid encrypted provider key");
  }
  const iv = Buffer.from(parts[1], "base64url");
  const tag = Buffer.from(parts[2], "base64url");
  const ciphertext = Buffer.from(parts[3], "base64url");
  if (iv.length !== 12 || tag.length !== 16) throw new Error("Invalid encrypted provider key");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  decipher.setAAD(associatedData(identity));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
