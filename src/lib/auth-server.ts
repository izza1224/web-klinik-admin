import crypto from "crypto";

// Kunci rahasia untuk menandatangani token sesi (HMAC-SHA256)
// Di production (Vercel), user bisa menambahkan environment variable SESSION_SECRET
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "homecareku-super-secret-salt-key-9283748234-klinik-medis-2026";

// Kredensial default (dapat ditimpa melalui Environment Variables Vercel)
const DEFAULT_ADMIN_USER = process.env.ADMIN_USERNAME || "admin";
const DEFAULT_ADMIN_PASS = process.env.ADMIN_PASSWORD || "admin 123";

// In-Memory Rate Limiter untuk mencegah brute force attack
interface AttemptInfo {
  count: number;
  lockedUntil: number;
}
const attemptsMap = new Map<string, AttemptInfo>();

const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 5 * 60 * 1000; // 5 menit

/**
 * Cek apakah IP sedang terkena rate limit
 */
export function checkRateLimit(ip: string): { blocked: boolean; remainingMs?: number } {
  const now = Date.now();
  const info = attemptsMap.get(ip);

  if (!info) return { blocked: false };

  if (info.lockedUntil > now) {
    return { blocked: true, remainingMs: info.lockedUntil - now };
  }

  // Jika masa lock sudah lewat, reset counter
  if (info.lockedUntil > 0 && info.lockedUntil <= now) {
    attemptsMap.delete(ip);
    return { blocked: false };
  }

  return { blocked: false };
}

/**
 * Catat percobaan login yang gagal
 */
export function recordFailedAttempt(ip: string): { isNowBlocked: boolean; attemptsLeft: number } {
  const now = Date.now();
  const info = attemptsMap.get(ip) || { count: 0, lockedUntil: 0 };
  info.count += 1;

  if (info.count >= MAX_ATTEMPTS) {
    info.lockedUntil = now + LOCK_TIME_MS;
    attemptsMap.set(ip, info);
    return { isNowBlocked: true, attemptsLeft: 0 };
  }

  attemptsMap.set(ip, info);
  return { isNowBlocked: false, attemptsLeft: MAX_ATTEMPTS - info.count };
}

/**
 * Reset percobaan saat berhasil login
 */
export function resetLoginAttempts(ip: string) {
  attemptsMap.delete(ip);
}

/**
 * Verifikasi kredensial di sisi server (aman dari inspeksi client bundle)
 */
export function verifyCredentials(user: string, pass: string): boolean {
  const cleanUser = (user || "").trim().toLowerCase();
  const cleanPass = (pass || "").trim();

  const targetUser = DEFAULT_ADMIN_USER.trim().toLowerCase();
  const targetPass = DEFAULT_ADMIN_PASS.trim();

  // Cocokkan username
  if (cleanUser !== targetUser) return false;

  // Cocokkan password (mendukung 'admin 123' atau 'admin123' untuk fleksibilitas)
  if (cleanPass === targetPass) return true;
  if (targetPass === "admin 123" && cleanPass === "admin123") return true;

  return false;
}

/**
 * Buat token sesi yang ditandatangani HMAC-SHA256
 */
export function createSessionToken(username: string): string {
  const payload = {
    u: username,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // Aktif 7 hari
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

/**
 * Verifikasi keaslian dan masa berlaku token sesi
 */
export function verifySessionToken(token: string): { valid: boolean; username?: string } {
  if (!token || typeof token !== "string") return { valid: false };

  const parts = token.split(".");
  if (parts.length !== 2) return { valid: false };

  const [encodedPayload, receivedSignature] = parts;

  // Hitung ulang signature
  const expectedSignature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(encodedPayload)
    .digest("base64url");

  // Validasi signature dengan timingSafeEqual untuk mencegah timing attack
  try {
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(receivedSignature),
      Buffer.from(expectedSignature)
    );
    if (!isSignatureValid) return { valid: false };

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf-8"));
    if (!payload.exp || Date.now() > payload.exp) {
      return { valid: false };
    }

    return { valid: true, username: payload.u };
  } catch {
    return { valid: false };
  }
}
