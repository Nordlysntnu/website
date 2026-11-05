'use client'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { articleReadiness, articleText } from '../lib/editorial'

export function ArticleChecklist() {
  const title = useFormFields(([fields]) => fields.title?.value)
  const content = useFormFields(([fields]) => fields.content?.value)
  const summary = useFormFields(([fields]) => fields.summary?.value)
  const cover = useFormFields(([fields]) => fields.coverImage?.value)
  const { hasPublishedDoc, data, id } = useDocumentInfo()
  const required = articleReadiness({ title, content })
  const words = articleText(content).trim().split(/\s+/).filter(Boolean).length
  return <section className="article-checklist" aria-label="Article checklist">
    <h3 className="editorial-label">Before you send it</h3>
    <ul>{required.filter((item) => item.key !== 'prompts' || !item.complete).map((item) => <li key={item.key}>
      <span className={item.complete ? 'checklist-done' : 'checklist-pending'} aria-hidden="true">{item.complete ? '✓' : '○'}</span>
      <span>{item.label}{item.complete && <span className="sr-only">: complete</span>}</span>
    </li>)}
      <li><span className={summary ? 'checklist-done' : 'checklist-pending'} aria-hidden="true">{summary ? '✓' : '○'}</span><span>Add a short introduction <small>Recommended</small></span></li>
      <li><span className={cover ? 'checklist-done' : 'checklist-pending'} aria-hidden="true">{cover ? '✓' : '○'}</span><span>Choose a cover photo <small>Optional; otherwise we use a gallery or body photo</small></span></li>
    </ul>
    <p className="review-action__help">{words} {words === 1 ? 'word' : 'words'} · {Math.max(1, Math.ceil(words / 200))} min read</p>
    <div className="article-checklist__publishing">
      <strong>{hasPublishedDoc ? 'Published version available' : 'Private draft'}</strong>
      <p>{hasPublishedDoc ? 'Draft edits stay private until a publisher publishes the revision.' : 'Only signed-in editors can see this draft.'}</p>
      {hasPublishedDoc && id && <a href={`/blog/${id}`} target="_blank" rel="noreferrer">View the published article ↗</a>}
    </div>
    <p className="review-action__help">Publishing here updates the local demo only.</p>
    {data?.lastEditedBy && <p className="review-action__help">Last saved by {data.lastEditedBy}</p>}
  </section>
}
