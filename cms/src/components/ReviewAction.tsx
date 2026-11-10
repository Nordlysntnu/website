'use client'
import { useEffect, useState } from 'react'
import { useAuth, useConfig, useDocumentInfo, useField, useForm } from '@payloadcms/ui'
import type { SelectFieldClientComponent } from 'payload'
import { editorialDate } from '../lib/editorial'

type ReviewState = 'writing' | 'ready' | 'changes'

export const ReviewAction: SelectFieldClientComponent = ({ path, readOnly }) => {
  const { value, setValue, disabled, formInitializing, formProcessing } = useField<ReviewState>({ path })
  const { value: note, setValue: setNote } = useField<string>({ path: 'reviewNote' })
  const { value: reviewerId, setValue: setReviewerID } = useField<number | null>({ path: 'reviewerId' })
  const { submit } = useForm()
  const { user } = useAuth()
  const { id, collectionSlug, uploadStatus, documentIsLocked, data } = useDocumentInfo()
  const { config: { routes: { api } } } = useConfig()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [composing, setComposing] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [reviewers, setReviewers] = useState<{ id: number; name: string }[]>([])
  const [reviewersLoaded, setReviewersLoaded] = useState(false)
  const [reviewersError, setReviewersError] = useState(false)
  const publisher = ['publisher', 'admin'].includes(user?.role || '')
  const ready = value === 'ready'
  const returned = value === 'changes'
  const unavailable = Boolean(readOnly || disabled || formInitializing || formProcessing || documentIsLocked || saving || uploadStatus === 'uploading' || collectionSlug !== 'posts')
  const helpID = `${path}-review-help`
  const storedNote = note || data?.reviewNote

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${api}/users/reviewers`, { signal: controller.signal }).then(async (res) => {
      if (!res.ok) throw new Error('Could not load reviewers')
      const result = await res.json()
      setReviewers(result.reviewers)
      setReviewersLoaded(true)
    }).catch(() => { if (!controller.signal.aborted) setReviewersError(true) })
    return () => controller.abort()
  }, [api])

  async function changeReview(next: ReviewState) {
    if (unavailable) return
    if (next === 'changes' && !feedback.trim()) {
      setError('Explain what needs changing so the writer knows what to do.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const result = await submit({
        action: `${api}/posts${id ? `/${id}` : ''}?draft=true&depth=0`,
        method: id ? 'PATCH' : 'POST',
        overrides: { review: next, reviewerId: reviewerId ?? null, _status: 'draft', ...(next === 'changes' ? { reviewNote: feedback.trim() } : {}) },
      })
      if (result?.res.ok) {
        setValue(next, true)
        if (next === 'changes') setNote(feedback.trim(), true)
        setComposing(false)
        setFeedback('')
      } else setError('Could not save. Check the article checklist and any field errors, then try again.')
    } catch {
      setError('Could not save. Your edits are still in the editor. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return <section className="review-action" aria-label="Article review">
    <h3 className="editorial-label">Review</h3>
    <label className="reviewer-label" htmlFor={`${path}-reviewer`}>Responsible reviewer</label>
    <select className="reviewer-select" id={`${path}-reviewer`} value={reviewerId ?? ''}
      disabled={unavailable || !reviewersLoaded} onChange={(event) => setReviewerID(event.target.value ? Number(event.target.value) : null)}>
      <option value="">Shared queue — any publisher</option>
      {reviewerId && !reviewers.some((reviewer) => reviewer.id === reviewerId) &&
        <option value={reviewerId}>{data?.reviewerName || 'Previously selected reviewer'}</option>}
      {reviewers.map((reviewer) => <option key={reviewer.id} value={reviewer.id}>{reviewer.name}</option>)}
    </select>
    <p className="review-action__help">All publishers can still help from the shared review queue.</p>
    {reviewersError && <p className="review-action__error" role="alert">Could not load reviewers. Reload to choose a person; the shared queue is still available.</p>}
    <p className={`editorial-badge editorial-badge--${value || 'writing'}`} role="status">
      {ready ? 'Ready for review' : returned ? 'Changes requested' : 'In progress'}
    </p>
    {storedNote && <div className="review-action__feedback">
      <strong>{returned ? 'Please update this draft' : 'Previous feedback'}</strong>
      <p>{storedNote}</p>
      {data?.reviewedBy && <small>{data.reviewedBy}{data.reviewedAt ? ` · ${editorialDate(data.reviewedAt)}` : ''}</small>}
    </div>}
    {id && <a className="editorial-preview" href={`/preview/${id}`} target="_blank" rel="noreferrer">Preview this draft ↗</a>}
    <button type="button" className={`review-action__button${ready ? ' review-action__button--secondary' : ''}`}
      disabled={unavailable} aria-busy={saving} aria-describedby={helpID} onClick={() => void changeReview(ready ? 'writing' : 'ready')}>
      {saving ? 'Saving…' : ready ? 'Withdraw review request' : returned ? 'Send again for review' : 'Send for review'}
    </button>
    <p className="review-action__help" id={helpID}>{ready
      ? publisher ? 'Check the preview. Use Publish changes above to publish, or request changes below.' : 'A publisher can review this draft. You can keep editing it while it waits.'
      : 'Saves your current draft for review. Only a publisher can publish it.'}</p>
    {publisher && !composing && <button type="button" className="review-action__text-button" disabled={unavailable || !id}
      onClick={() => { setComposing(true); setError('') }}>Request changes</button>}
    {publisher && composing && <div className="review-action__composer">
      <label htmlFor={`${path}-feedback`}>What should the writer change?</label>
      <textarea id={`${path}-feedback`} rows={4} maxLength={2000} value={feedback} disabled={unavailable}
        placeholder="Be specific: what needs changing, and why?" onChange={(event) => setFeedback(event.target.value)} />
      <p className="review-action__help">Internal feedback. This will never appear on the blog.</p>
      <button type="button" className="review-action__button" disabled={unavailable} onClick={() => void changeReview('changes')}>Save and request changes</button>
      <button type="button" className="review-action__text-button" disabled={unavailable} onClick={() => { setComposing(false); setFeedback(''); setError('') }}>Cancel</button>
    </div>}
    {data?.submittedBy && ready && <p className="review-action__help">Sent by {data.submittedBy}{data.submittedAt ? ` · ${editorialDate(data.submittedAt)}` : ''}</p>}
    {error && <p className="review-action__error" role="alert">{error}</p>}
  </section>
}
