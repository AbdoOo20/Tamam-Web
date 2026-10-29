import { inject, Service } from '@angular/core';

import { APP_ENVIRONMENT } from '../config/app-environment';

const IV_BYTES = 12;
const PBKDF2_ITERATIONS = 100_000;

/**
 * localStorage wrapper that encrypts every value with AES-GCM (Web Crypto).
 * Nothing is ever written in clear text: if encryption is not available the value is simply not stored.
 *
 * Note: the key is derived from `environment.storageSecret`, which ships with the app. This stops
 * casual reading of the storage, it is not protection against a script running inside the page.
 */
@Service()
export class SecureStorage {
  private readonly environment = inject(APP_ENVIRONMENT);
  private keyPromise: Promise<CryptoKey> | null = null;

  async setItem(key: string, value: unknown): Promise<void> {
    try {
      const cryptoKey = await this.getKey();
      const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
      const plain = new TextEncoder().encode(JSON.stringify(value));
      const cipher = new Uint8Array(
        await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, plain),
      );
      const packed = new Uint8Array(IV_BYTES + cipher.length);

      packed.set(iv, 0);
      packed.set(cipher, IV_BYTES);
      localStorage.setItem(this.storageKey(key), toBase64(packed));
    } catch {
      this.removeItem(key);
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const stored = localStorage.getItem(this.storageKey(key));

      if (!stored) {
        return null;
      }

      const packed = fromBase64(stored);
      const iv = packed.slice(0, IV_BYTES);
      const cipher = packed.slice(IV_BYTES);
      const plain = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        await this.getKey(),
        cipher,
      );

      return JSON.parse(new TextDecoder().decode(plain)) as T;
    } catch {
      // Tampered, corrupted, or written with another secret: treat it as missing.
      this.removeItem(key);

      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(this.storageKey(key));
    } catch {
      // Storage can be blocked by the browser; nothing to remove then.
    }
  }

  private storageKey(key: string): string {
    return `${this.environment.storagePrefix}.${key}`;
  }

  private getKey(): Promise<CryptoKey> {
    this.keyPromise ??= this.deriveKey();

    return this.keyPromise;
  }

  private async deriveKey(): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const material = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.environment.storageSecret),
      'PBKDF2',
      false,
      ['deriveKey'],
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode(`${this.environment.storagePrefix}:${location.origin}`),
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      material,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );
  }
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}
