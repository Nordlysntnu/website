'use client'
import { useState } from 'react'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { articleURL, linkedInShareURL, linkedInText } from '../lib/share'

type Copied = 'link' | 'text' | 'failed' | null

/** Sidebar panel on a published article: its public link, a LinkedIn text and LinkedIn's share window. */
export function ShareArticle({ websiteURL }: { websiteURL?: string }) {
  const { hasPublishedDoc, id, data } = useDocumentInfo()
  const title = useFormFields(([fields]) => fields.title?.value) as string | undefined
  const summary = useFormFields(([fields]) => fields.summary?.value) as string | undefined
  const [copied, setCopied] = useState<Copied>(null)
  if (!hasPublishedDoc || !id) return null
  const url = articleURL(websiteURL, data?.legacyKey, id)
  const text = linkedInText({ title, summary, url })
  const copy = async (what: 'link' | 'text', value: string) => {
    try { await navigator.clipboard.writeText(value); setCopied(what) } catch { setCopied('failed') }
  }
  const status = copied === 'link' ? 'Link copied.'
    : copied === 'text' ? 'Text copied. Paste it into a new LinkedIn post and add a photo if you like.'
    : copied === 'failed' ? 'Copying did not work here. Select the text below and copy it yourself.'
    : 'Links show the title, introduction and cover photo of the published version.'
  return <section className="article-share" aria-label="Share the article">
    <h3 className="editorial-label">Share</h3>
    <a className="article-share__link" href={url} target="_blank" rel="noreferrer">{url.replace(/^https?:\/\//, '')} ↗</a>
    <div className="article-share__buttons">
      <button type="button" onClick={() => copy('link', url)}>Copy link</button>
      <button type="button" onClick={() => copy('text', text)}>Copy LinkedIn text</button>
      <a href={linkedInShareURL(url)} target="_blank" rel="noreferrer">Share on LinkedIn ↗</a>
    </div>
    <p className="review-action__help" role="status">{status}</p>
    <details className="article-share__text"><summary>Show the LinkedIn text</summary><textarea readOnly value={text} rows={7} /></details>
    <p className="review-action__help">A new article is on the website when Website publication on the overview says it is ready.</p>
  </section>
}
