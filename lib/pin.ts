import crypto from 'crypto'

const PIN_SALT = process.env.ACCESS_PIN_SALT ?? process.env.ADMIN_SECRET ?? 'memorybanner-pin'

export function normalizePin(pin: string): string {
  return pin.trim()
}

export function isValidPin(pin: string): boolean {
  return /^[0-9]{4,8}$/.test(pin)
}

export function hashPin(pin: string): string {
  return crypto
    .createHash('sha256')
    .update(`${PIN_SALT}:${normalizePin(pin)}`)
    .digest('hex')
}

export function verifyPin(pin: string, expectedHash: string | null): boolean {
  if (!expectedHash) return false
  const candidate = hashPin(pin)
  const expectedBuffer = Buffer.from(expectedHash)
  const candidateBuffer = Buffer.from(candidate)
  if (expectedBuffer.length !== candidateBuffer.length) return false
  return crypto.timingSafeEqual(expectedBuffer, candidateBuffer)
}
