import { afterEach, describe, expect, it } from "vitest";
import { decryptProviderKey, encryptProviderKey } from "./provider-key-crypto";

const key = Buffer.alloc(32, 7).toString("base64");
const identity = { userId: 42, provider: "openai" };

afterEach(() => { delete process.env.API_KEY_ENCRYPTION_KEY; });

describe("provider key encryption", () => {
  it("encrypts and recovers Unicode provider keys with unique nonces", () => {
    process.env.API_KEY_ENCRYPTION_KEY = key;
    const first = encryptProviderKey("sëcret-🔑", identity);
    const second = encryptProviderKey("sëcret-🔑", identity);
    expect(first).toMatch(/^v1\./);
    expect(first).not.toBe(second);
    expect(first).not.toContain("sëcret-🔑");
    expect(decryptProviderKey(first, identity)).toBe("sëcret-🔑");
  });

  it("rejects ciphertext swapped between users or providers", () => {
    process.env.API_KEY_ENCRYPTION_KEY = key;
    const encrypted = encryptProviderKey("secret", identity);
    expect(() => decryptProviderKey(encrypted, { ...identity, userId: 43 })).toThrow();
    expect(() => decryptProviderKey(encrypted, { ...identity, provider: "claude" })).toThrow();
  });

  it("rejects altered ciphertext and wrong encryption keys", () => {
    process.env.API_KEY_ENCRYPTION_KEY = key;
    const encrypted = encryptProviderKey("secret", identity);
    const parts = encrypted.split(".");
    const tag = Buffer.from(parts[2], "base64url");
    tag[0] ^= 1;
    parts[2] = tag.toString("base64url");
    expect(() => decryptProviderKey(parts.join("."), identity)).toThrow();
    process.env.API_KEY_ENCRYPTION_KEY = Buffer.alloc(32, 8).toString("base64");
    expect(() => decryptProviderKey(encrypted, identity)).toThrow();
  });

  it("rejects missing or malformed encryption keys", () => {
    expect(() => encryptProviderKey("secret", identity)).toThrow(/API_KEY_ENCRYPTION_KEY/);
    process.env.API_KEY_ENCRYPTION_KEY = "default-key-change-me";
    expect(() => encryptProviderKey("secret", identity)).toThrow(/API_KEY_ENCRYPTION_KEY/);
  });

  it("rejects legacy XOR records and asks the user to re-enter the key", () => {
    process.env.API_KEY_ENCRYPTION_KEY = key;
    expect(() => decryptProviderKey("bGVnYWN5", identity)).toThrow(/re-enter/i);
  });
});
