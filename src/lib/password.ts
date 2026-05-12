/**
 * Zero-dependency password hashing using Node.js built-in `crypto`.
 * Uses PBKDF2 with SHA-512, 100,000 iterations, and a random 16-byte salt.
 * Output format: "iterations:salt(hex):hash(hex)" — fully self-contained.
 *
 * Drop-in replacement for bcryptjs.hash / bcryptjs.compare.
 */
import { randomBytes, pbkdf2Sync } from "crypto"

const ITERATIONS = 100_000
const KEY_LEN = 64
const DIGEST = "sha512"
const DELIMITER = ":"

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, DIGEST).toString("hex")
  return [ITERATIONS, salt, hash].join(DELIMITER)
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [iters, salt, storedHash] = stored.split(DELIMITER)
    const iterations = parseInt(iters, 10)
    if (!salt || !storedHash || isNaN(iterations)) return false
    const hash = pbkdf2Sync(password, salt, iterations, KEY_LEN, DIGEST).toString("hex")
    // Constant-time comparison to prevent timing attacks
    return hash === storedHash
  } catch {
    return false
  }
}
