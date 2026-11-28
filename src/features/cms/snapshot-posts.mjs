import { readFile } from 'node:fs/promises'
import { combinePosts } from './legacy-posts.mjs'
import { readLocalPosts, safeLink, localPreviewEnabled, localBlogProps, photoLayout } from './local-posts.mjs'
import { isYoutubeId } from './video.mjs'

const safeId = value => Number.isSafeInteger(value) && value > 0
const safeKey = value => typeof value === 'string' && /^legacy-[a-f0-9]{20}$/.test(value)
const mediaURL = value => typeof value === 'string' && /^\/cms-media\/[a-f0-9]{64}\.(jpg|png|webp)$/.test(value)
const percent = value => typeof value === 'number' && value >= 0 && value <= 100 ? value : null
function photo(value) {
    if (!value) return null
    if (!mediaURL(value.url) || (value.small != null && !mediaURL(value.small))) throw new Error('Invalid snapshot image.')
    // Older snapshots have no small version or focal point; the website then uses the photo itself and the centre.
    const focal = percent(value.focalX) !== null && percent(value.focalY) !== null ? { focalX: value.focalX, focalY: value.focalY } : {}
    return { url: value.url, alt: String(value.alt || ''), width: Number(value.width) || null, height: Number(value.height) || null,
        small: value.small || null, ...focal }
}
function nodes(value, depth=0) {
    if (!Array.isArray(value) || depth > 30) throw new Error('Invalid snapshot article body.')
    return value.flatMap(node => {
        if (!node || typeof node !== 'object') throw new Error('Invalid snapshot node.')
        if (node.type === 'text') return [{ type:'text', text:String(node.text || ''), format:Number(node.format)||0 }]
        if (node.type === 'linebreak') return [{ type:'linebreak' }]
        if (node.type === 'photo') return [{ type:'photo', photo:photo(node.photo), caption:String(node.caption || ''), layout:photoLayout(node.layout) }]
        if (node.type === 'photoRow') {
            if (!Array.isArray(node.photos) || node.photos.length < 1 || node.photos.length > 4) throw new Error('Invalid snapshot photo row.')
            const photos = node.photos.map(photo)
            if (photos.some(item => !item)) throw new Error('Invalid snapshot photo row.')
            return [{ type:'photoRow', photos, caption:String(node.caption || '') }]
        }
        if (node.type === 'video') {
            if (!isYoutubeId(node.youtubeId)) throw new Error('Invalid snapshot video.')
            return [{ type:'video', youtubeId:node.youtubeId, caption:String(node.caption || '') }]
        }
        if (!['paragraph','heading','quote','list','listitem','link'].includes(node.type)) throw new Error('Unsupported snapshot node.')
        return [{ type:node.type, tag:node.tag === 'h3' ? 'h3' : node.tag === 'ol' ? 'ol' : null,
            ...(node.type === 'link' ? { url:safeLink(node.url) } : {}), children:nodes(node.children || [],depth+1) }]
    })
}
export function validateSnapshot(value) {
    if (value?.schema !== 1 || !Array.isArray(value.posts) || !Array.isArray(value.managedLegacyKeys) ||
        !value.managedLegacyKeys.every(safeKey)) throw new Error('Invalid website snapshot.')
    const ids = new Set()
    const posts = value.posts.map(p => {
        if (!safeId(p.id) || ids.has(p.id) || (p.legacyKey && !safeKey(p.legacyKey)) || !Number.isFinite(Date.parse(p.publishedAt))) throw new Error('Invalid snapshot article.')
        ids.add(p.id)
        // Re-project the file too: arbitrary extra fields must never reach __NEXT_DATA__.
        return { id:p.id, legacyKey:p.legacyKey || null, slug:p.legacyKey || String(p.id),
            title:String(p.title || ''), summary:String(p.summary || ''), author:String(p.author || ''), department:String(p.department || 'Team'),
            publishedAt:p.publishedAt, nodes:nodes(p.nodes), gallery:(p.gallery || []).map(photo), cover:photo(p.cover), excerpt:String(p.excerpt || '').slice(0,320) }
    })
    return { posts, managedLegacyKeys:[...new Set(value.managedLegacyKeys)] }
}
export async function readWebsitePosts({ env=process.env, legacyBlogs=[], fetcher=fetch }={}) {
    if (env.NORDLYS_CMS_SNAPSHOT) {
        const snapshot = validateSnapshot(JSON.parse(await readFile(env.NORDLYS_CMS_SNAPSHOT,'utf8')))
        return combinePosts(snapshot.posts,snapshot.managedLegacyKeys,legacyBlogs)
    }
    return localPreviewEnabled(env) ? readLocalPosts({ env, fetcher }) : null
}
export const articleCards = posts => posts?.map(({id,slug,title,department,publishedAt,cover,excerpt}) => ({id,slug,title,department,publishedAt,cover,excerpt})) ?? null
export async function websiteBlogProps(legacyBlogs) {
    if (!process.env.NORDLYS_CMS_SNAPSHOT) {
        const result = await localBlogProps()
        return { ...result, cmsPosts:articleCards(result.cmsPosts) }
    }
    const posts = await readWebsitePosts({ legacyBlogs })
    return { cmsPosts:articleCards(posts), cmsError:null }
}
