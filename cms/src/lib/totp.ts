import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

// RFC 6238 time-based one-time codes (SHA-1, 6 digits, 30 seconds), compatible with
// common authenticator apps. No external dependency.
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
export const TOTP_PERIOD = 30

export function base32Encode(buffer: Buffer) {
  let bits = 0, value = 0, output = ''
  for (const byte of buffer) {
    value = (value << 8) | byte; bits += 8
    while (bits >= 5) { output += ALPHABET[(value >>> (bits - 5)) & 31]; bits -= 5 }
  }
  if (bits > 0) output += ALPHABET[(value << (5 - bits)) & 31]
  return output
}

export function base32Decode(input: string) {
  const clean = input.toUpperCase().replace(/[\s=-]/g, '')
  let bits = 0, value = 0
  const bytes: number[] = []
  for (const char of clean) {
    const index = ALPHABET.indexOf(char)
    if (index < 0) throw new Error('Invalid base32 secret.')
    value = (value << 5) | index; bits += 5
    if (bits >= 8) { bytes.push((value >>> (bits - 8)) & 255); bits -= 8 }
  }
  return Buffer.from(bytes)
}

export const generateTotpSecret = () => base32Encode(randomBytes(20))

export function totpCode(secret: string, step: number) {
  const counter = Buffer.alloc(8)
  counter.writeBigUInt64BE(BigInt(step))
  const hmac = createHmac('sha1', base32Decode(secret)).update(counter).digest()
  const offset = hmac[hmac.length - 1] & 15
  const binary = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000
  return String(binary).padStart(6, '0')
}

export const currentStep = (now = Date.now()) => Math.floor(now / 1000 / TOTP_PERIOD)

/** Returns the matching time step (±1 step clock drift), or null. */
export function verifyTotp(secret: string, code: string, now = Date.now()) {
  const candidate = String(code || '').replace(/\s/g, '')
  if (!/^\d{6}$/.test(candidate)) return null
  const step = currentStep(now)
  for (const drift of [0, -1, 1]) {
    const expected = Buffer.from(totpCode(secret, step + drift))
    if (timingSafeEqual(expected, Buffer.from(candidate))) return step + drift
  }
  return null
}

export function otpauthURI(secret: string, account: string, issuer = 'Nordlys CMS') {
  const label = encodeURIComponent(issuer + ':' + account)
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=${TOTP_PERIOD}`
}

// Secrets are encrypted at rest with a key derived from PAYLOAD_SECRET (AES-256-GCM).
const key = (appSecret: string) => createHash('sha256').update('nordlys-cms-totp:' + appSecret).digest()

export function sealSecret(secret: string, appSecret: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(appSecret), iv)
  const data = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()])
  return ['v1', iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), data.toString('base64url')].join('.')
}

export function openSecret(sealed: string, appSecret: string) {
  const [version, iv, tag, data] = sealed.split('.')
  if (version !== 'v1' || !iv || !tag || !data) throw new Error('Unsupported 2FA secret format.')
  const decipher = createDecipheriv('aes-256-gcm', key(appSecret), Buffer.from(iv, 'base64url'))
  decipher.setAuthTag(Buffer.from(tag, 'base64url'))
  return Buffer.concat([decipher.update(Buffer.from(data, 'base64url')), decipher.final()]).toString('utf8')
}
