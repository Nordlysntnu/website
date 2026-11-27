import { createHash } from 'node:crypto'
import { readFile, mkdir, writeFile, lstat } from 'node:fs/promises'
import path from 'node:path'
import type { Payload } from 'payload'
import { publicPost } from '../../../src/features/cms/local-posts.mjs'
import { postPhotoIDs } from '../lib/blog'
import type { Media } from '../payload-types'
import { WEB_IMAGE_VERSION, cachedWebImage } from './web-images'

export const hash = (value: string | Buffer) => createHash('sha256').update(value).digest('hex')
export async function publishedContent(payload: Payload) {
  const posts = (await payload.find({ collection:'posts', where:{ _status:{ equals:'published' } },
    draft:false, depth:0, pagination:false, overrideAccess:true, sort:'id' })).docs
  const ids = [...new Set(posts.flatMap(postPhotoIDs))]
  const media = ids.length ? (await payload.find({ collection:'media', where:{ id:{ in:ids } },
    depth:0, pagination:false, overrideAccess:true })).docs : []
  const map = new Map(media.map(photo=>[photo.id,photo]))
  const mappings = await payload.find({ collection:'legacy-imports', depth:0, pagination:false, overrideAccess:true, sort:'key' })
  const managedLegacyKeys = mappings.docs.map(item=>item.key)
  const photoID = (value: unknown) => {
    const id = typeof value === 'object' && value && 'id' in value ? value.id : value
    if (typeof id!=='number' || !map.has(id)) throw new Error('A published article has an unavailable photo.')
    return id
  }
  const project = (resolve: (photo: Media) => { url:string; alt:string; width:number|null; height:number|null }) => posts.map(post => publicPost(post, {
    postIDs: new Set(posts.map(post => post.id)),
    photo: (value: unknown) => value ? resolve(map.get(photoID(value))!) : null,
  }))
  const logicalPosts = project(photo => ({ url:'media:' + photo.id + ':' + photo.filename + ':' + photo.updatedAt,
    alt:photo.alt, width:photo.width || null, height:photo.height || null }))
  // The image settings are part of the content: changing them rebuilds the website once.
  const contentHash = hash(JSON.stringify({ posts:logicalPosts, managedLegacyKeys, webImages:WEB_IMAGE_VERSION }))
  return { posts, media, managedLegacyKeys, contentHash, project }
}
export type PublicPhoto = { url:string; alt:string; width:number|null; height:number|null; small?:string; focalX?:number; focalY?:number }
const focal = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100 ? Math.round(value * 10) / 10 : undefined

/** Writes the public snapshot. Photos are web versions of the private originals (see web-images.ts). */
export async function writePublicSnapshot(content: Awaited<ReturnType<typeof publishedContent>>, uploadDir: string, target: string, imageCacheDir?: string) {
  await mkdir(path.join(target,'cms-media'),{recursive:true})
  const photos = new Map<number,PublicPhoto>()
  const assets: {path:string;sha256:string;bytes:number}[] = []
  const publish = async (data: Buffer, format: string) => {
    const digest = hash(data)
    const relative = 'cms-media/' + digest + '.' + format
    if (!assets.some(a=>a.path===relative)) {
      await writeFile(path.join(target,relative),data,{mode:0o600})
      assets.push({path:relative,sha256:digest,bytes:data.length})
    }
    return '/' + relative
  }
  for (const photo of content.media) {
    const filename = photo.filename
    if (!filename || filename !== path.basename(filename) || /[\\/\x00]/.test(filename)) throw new Error('Invalid published image filename.')
    const source = path.join(uploadDir,filename)
    if ((await lstat(source)).isSymbolicLink()) throw new Error('Published images cannot be symlinks.')
    const data = await readFile(source)
    const large = await cachedWebImage(data, photo.mimeType || '', 'large', imageCacheDir)
    const small = await cachedWebImage(data, photo.mimeType || '', 'small', imageCacheDir)
    const url = await publish(large.data, large.format)
    const smallURL = await publish(small.data, small.format)
    photos.set(photo.id,{url,alt:photo.alt,width:large.width,height:large.height,
      ...(smallURL !== url ? { small:smallURL } : {}),
      ...(focal(photo.focalX) !== undefined && focal(photo.focalY) !== undefined ? { focalX:focal(photo.focalX), focalY:focal(photo.focalY) } : {})})
  }
  const snapshot = { schema:1, posts:content.project(photo=>photos.get(photo.id)!), managedLegacyKeys:content.managedLegacyKeys }
  const file = path.join(target,'snapshot.json')
  await writeFile(file,JSON.stringify(snapshot),{mode:0o600})
  return { snapshot, file, assets }
}
