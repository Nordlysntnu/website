import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

// Photos on the website are re-encoded from the private originals: a large version for the article
// and a small one for cards, photo rows and the gallery. Bump the version when the settings change,
// so cached versions are made again.
export const WEB_IMAGE_VERSION = 1
export const WEB_IMAGE_SIZES = { large: 2000, small: 800 } as const
export type WebImageSize = keyof typeof WEB_IMAGE_SIZES
type Format = 'jpg' | 'png' | 'webp'
export type WebImage = { data: Buffer; format: Format; width: number; height: number }

const FORMATS: Record<string, Format> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

/** Scales a photo to fit inside the size, turns it upright and drops its metadata. Never returns more bytes than the original. */
export async function webImage(source: Buffer, mimeType: string, size: WebImageSize): Promise<WebImage> {
  const format = FORMATS[mimeType]
  if (!format) throw new Error('Unsupported published image type.')
  const max = WEB_IMAGE_SIZES[size]
  const original = await sharp(source).metadata()
  let image = sharp(source).rotate().resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true })
  image = format === 'jpg' ? image.jpeg({ quality: 80, mozjpeg: true })
    : format === 'webp' ? image.webp({ quality: 80 })
    : image.png({ compressionLevel: 9, adaptiveFiltering: true })
  const { data, info } = await image.toBuffer({ resolveWithObject: true })
  // A photo that is already small and well compressed is published as it is, unless it carries
  // metadata such as camera details or a location, which the re-encoded version leaves out.
  const upright = (original.orientation ?? 1) <= 1
  const fits = (original.width ?? Infinity) <= max && (original.height ?? Infinity) <= max
  const bare = !original.exif && !original.xmp && !original.iptc
  if (upright && fits && bare && data.length >= source.length) {
    return { data: source, format, width: original.width!, height: original.height! }
  }
  return { data, format, width: info.width, height: info.height }
}

/** webImage with a private cache keyed by the original's bytes, so rebuilds skip unchanged photos. */
export async function cachedWebImage(source: Buffer, mimeType: string, size: WebImageSize, cacheDir?: string): Promise<WebImage> {
  if (!cacheDir) return webImage(source, mimeType, size)
  const key = createHash('sha256').update(source).digest('hex') + `-${size}-v${WEB_IMAGE_VERSION}`
  const file = path.join(cacheDir, key)
  try {
    const meta = JSON.parse(await readFile(file + '.json', 'utf8'))
    const data = await readFile(file + '.' + meta.format)
    if (createHash('sha256').update(data).digest('hex') === meta.sha256) return { data, format: meta.format, width: meta.width, height: meta.height }
  } catch { /* not cached yet, or damaged: make it again */ }
  const image = await webImage(source, mimeType, size)
  await mkdir(cacheDir, { recursive: true, mode: 0o700 })
  const temporary = `${file}.${process.pid}.tmp`
  await writeFile(temporary, image.data, { mode: 0o600 })
  await rename(temporary, file + '.' + image.format)
  const meta = { format: image.format, width: image.width, height: image.height, sha256: createHash('sha256').update(image.data).digest('hex') }
  await writeFile(file + '.json', JSON.stringify(meta), { mode: 0o600 })
  return image
}
