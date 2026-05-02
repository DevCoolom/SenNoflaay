/**
 * Password hashing utility using the Web Crypto API.
 * Uses SHA-256 with a static application salt to produce deterministic hashes.
 * This is a client-side hashing layer — not a replacement for server-side bcrypt,
 * but vastly better than storing passwords in plain text.
 */

const APP_SALT = 'SenNoflaay_v2_2026';

export async function hashPassword(password: string): Promise<string> {
  const salted = `${APP_SALT}:${password}`;
  const encoded = new TextEncoder().encode(salted);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
