'use client'
import { useLivePreview } from '@payloadcms/live-preview-react'
import type { Post } from '../payload-types'
import { PostArticle } from './PostArticle'

export function LivePost({ initialData, serverURL }: { initialData: Post; serverURL: string }) {
  const { data } = useLivePreview<Post>({ initialData, serverURL, depth: 2 })
  return <PostArticle post={data} />
}
