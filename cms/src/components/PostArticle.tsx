'use client'
import Link from 'next/link'
import { LinkJSXConverter, RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import type { SerializedUploadNode } from '@payloadcms/richtext-lexical'
import type { Post } from '../payload-types'
import { asPhoto, coverPhoto, monthAndYear } from '../lib/blog'
import { PhotoGallery } from './PhotoGallery'
import type React from 'react'

const photoLayouts = ['normal', 'wide', 'full', 'left', 'right']

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref: ({ linkNode }) => {
    const doc = linkNode.fields.doc
    const value = doc?.value
    const id = typeof value === 'object' && value ? value.id : value
    return doc?.relationTo === 'posts' && id ? `/blog/${encodeURIComponent(String(id))}` : '/blog'
  } }),
  upload: ({ node }) => {
    const upload = node as SerializedUploadNode
    const photo = upload.relationTo === 'media' ? asPhoto(upload.value) : undefined
    if (!photo) return null
    const caption = typeof upload.fields?.caption === 'string' ? upload.fields.caption : ''
    const layout = typeof upload.fields?.layout === 'string' && photoLayouts.includes(upload.fields.layout) ? upload.fields.layout : 'normal'
    return <figure className={`article-figure article-figure--${layout}`}>
      <img src={photo.url!} alt={photo.alt} width={photo.width || undefined} height={photo.height || undefined} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  },
  blocks: {
    photoRow: ({ node }: { node: { fields?: { photos?: { image?: unknown }[]; caption?: string | null } } }) => {
      const photos = (node.fields?.photos ?? []).flatMap(({ image }) => { const photo = asPhoto(image); return photo ? [photo] : [] })
      if (!photos.length) return null
      return <figure className="article-row" style={{ '--row-count': photos.length } as React.CSSProperties}>
        <div className="article-row__photos">
          {photos.map((photo) => <img key={photo.id} src={photo.url!} alt={photo.alt} width={photo.width || undefined} height={photo.height || undefined} />)}
        </div>
        {node.fields?.caption && <figcaption>{node.fields.caption}</figcaption>}
      </figure>
    },
  },
})

export function PostArticle({ post }: { post: Post }) {
  const cover = coverPhoto(post)
  const photos = (post.gallery ?? []).flatMap(({ image }) => {
    const photo = asPhoto(image)
    return photo ? [photo] : []
  })
  return <article className="post-article">
    <header className="article-heading">
      <Link className="article-back" href="/blog">← All updates</Link>
      <div className="article-meta"><span>{post.department || 'Team'}</span>
        <span aria-hidden="true">/</span><time dateTime={post.publishedAt}>{monthAndYear(post.publishedAt)}</time></div>
      <h1>{post.title || 'Your article title'}</h1>
      {post.authorName?.trim() && <p className="article-byline">By {post.authorName.trim()}</p>}
      {post.summary?.trim() && <p className="article-intro">{post.summary.trim()}</p>}
    </header>
    {cover && <div className="article-hero"><img src={cover.url!} alt={cover.alt} width={cover.width || undefined} height={cover.height || undefined} /></div>}
    <div className="article-reading">
      {post.content && <RichText className="article-body" data={post.content} converters={converters} />}
      <PhotoGallery photos={photos} imageFit={post.imageFit} />
      <div className="article-end"><span>NORDLYS NTNU</span><Link href="/blog">Explore more updates →</Link></div>
    </div>
  </article>
}
