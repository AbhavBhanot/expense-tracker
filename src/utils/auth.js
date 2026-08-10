/**
 * Pure validation utility functions for authentication.
 * Session management and user storage is now handled by Supabase.
 */

/**
 * Hashes a string password using browser native Web Crypto API (SHA-256).
 * Kept for backward compatibility — Supabase handles hashing server-side for new accounts.
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates email format using standard regex.
 */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Validates password strength (at least 6 characters).
 */
export function validatePassword(password) {
  return typeof password === 'string' && password.length >= 6;
}
