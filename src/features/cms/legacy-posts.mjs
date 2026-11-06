import { createHash } from 'node:crypto'
const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
export const legacyKeyFor = (blog) => blog.legacyKey || 'legacy-' + createHash('sha256')
    .update(JSON.stringify([blog.date, blog.text, blog.images])).digest('hex').slice(0,20)
export function legacyDate(value) {
    const match = /^(\w+) (\d{4})$/.exec(value || '')
    if (!match || !months.includes(match[1])) throw new Error('Invalid legacy article date.')
    return new Date(Date.UTC(Number(match[2]), months.indexOf(match[1]), 1)).toISOString()
}
export function legacyRichText(text) {
    return { root: { type: 'root', direction: 'ltr', format: '', indent: 0, version: 1,
        children: String(text).split(/\n\s*\n/).filter(Boolean).map(paragraph => ({
            type: 'paragraph', version: 1, children: paragraph.split('\n').flatMap((line, index) => [
                ...(index ? [{ type: 'linebreak', version: 1 }] : []),
                { type: 'text', text: line, detail: 0, format: 0, mode: 'normal', style: '', version: 1 },
            ]),
        })),
    } }
}
export function legacyProjection(blog) {
    const key = legacyKeyFor(blog)
    if (!/^legacy-[a-f0-9]{20}$/.test(key)) throw new Error('Invalid legacy article key.')
    const gallery = (blog.images || []).map((url,index) => {
        if (typeof url !== 'string' || !url.startsWith('/blog/') || /[\\\x00-\x20]/.test(url) || url.split('/').includes('..')) throw new Error('Invalid legacy image path.')
        return { url, alt: String(blog.imageAlts?.[index] || 'Nordlys team photo'), width: null, height: null }
    })
    const nodes = String(blog.text).split(/\n\s*\n/).filter(Boolean).map(p => ({ type: 'paragraph',
        children: p.split('\n').flatMap((line,index) => [...(index ? [{ type: 'linebreak' }] : []), { type: 'text', text: line, format: 0 }]) }))
    const first = String(blog.text).split(/[\n.!?]/).find(line => line.trim())?.trim() || 'Nordlys update'
    return { id: key, slug: key, legacyKey: key, title: first.slice(0,100), summary: '', author: '', department: 'Team',
        publishedAt: legacyDate(blog.date), nodes, gallery, cover: gallery[0] || null,
        excerpt: String(blog.text).replace(/\s+/g,' ').trim().slice(0,320) }
}
export function combinePosts(posts, managedKeys, legacyBlogs) {
    const managed = new Set(managedKeys)
    const keys = new Set()
    const current = posts.map(post => {
        if (post.legacyKey) {
            if (keys.has(post.legacyKey)) throw new Error('Duplicate imported article.')
            keys.add(post.legacyKey); managed.add(post.legacyKey)
        }
        return post
    })
    for (const blog of legacyBlogs) if (!managed.has(legacyKeyFor(blog))) current.push(legacyProjection(blog))
    return current.sort((a,b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || String(a.id).localeCompare(String(b.id)))
}
