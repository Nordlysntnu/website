'use client'
import { useEffect, useState } from 'react'
import { useField, useFormFields } from '@payloadcms/ui'
import { useBlockComponentContext } from '@payloadcms/richtext-lexical/client'
import type { Media } from '../../payload-types'

// The photo in the article editor, at the size and position it gets on the website, with the
// layout buttons on the photo itself (#169). Text wraps around small left/right photos here too.

export const PHOTO_LAYOUTS = [
  { value: 'normal', label: 'Normal', hint: 'Text width' },
  { value: 'wide', label: 'Wide', hint: 'A bit wider than the text' },
  { value: 'full', label: 'Full width', hint: 'Edge to edge' },
  { value: 'left', label: 'Small left', hint: 'Text wraps on the right' },
  { value: 'right', label: 'Small right', hint: 'Text wraps on the left' },
] as const

function LayoutIcon({ layout }: { layout: string }) {
  const photo = { normal: [5, 3, 14, 8], wide: [2, 3, 20, 8], full: [0, 3, 24, 8], left: [3, 3, 8, 7], right: [13, 3, 8, 7] }[layout] ?? [5, 3, 14, 8]
  const lines = layout === 'left' ? [[13, 4, 8], [13, 7, 8], [13, 10, 8]] : layout === 'right' ? [[3, 4, 8], [3, 7, 8], [3, 10, 8]] : [[5, 13.5, 14]]
  return <svg width="24" height="16" viewBox="0 0 24 16" aria-hidden="true" focusable="false">
    <rect x={photo[0]} y={photo[1]} width={photo[2]} height={photo[3]} rx="1" fill="currentColor" opacity=".85" />
    {lines.map(([x, y, w], i) => <rect key={i} x={x} y={y} width={w} height="1.4" rx=".7" fill="currentColor" opacity=".45" />)}
  </svg>
}

const mediaID = (value: unknown) => {
  const raw = value && typeof value === 'object' && 'id' in value ? (value as { id: unknown }).id : value
  return typeof raw === 'number' || (typeof raw === 'string' && /^\d+$/.test(raw)) ? String(raw) : null
}

export function PhotoBlockView() {
  const { EditButton, RemoveButton } = useBlockComponentContext()
  const image = useFormFields(([fields]) => fields.image?.value)
  const layoutField = useField<string>({ path: 'layout' })
  const captionField = useField<string>({ path: 'caption' })
  const layout = PHOTO_LAYOUTS.some((item) => item.value === layoutField.value) ? layoutField.value : 'normal'
  const id = mediaID(image)
  const [photo, setPhoto] = useState<Media | null>(image && typeof image === 'object' && 'url' in image ? image as Media : null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    if (!id || (photo && String(photo.id) === id)) return
    let current = true
    setMissing(false)
    fetch(`/api/media/${id}?depth=0`, { credentials: 'include' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error(String(response.status))))
      .then((doc: Media) => { if (current) setPhoto(doc) })
      .catch(() => { if (current) setMissing(true) })
    return () => { current = false }
  }, [id, photo])

  return <figure className={`nordlys-photo nordlys-photo--${layout}`} data-photo-layout={layout}>
    <div className="nordlys-photo__frame">
      {id && photo ? <img src={photo.url!} alt={photo.alt || ''} width={photo.width || undefined} height={photo.height || undefined} draggable={false} />
        : <div className="nordlys-photo__empty">{!id ? 'No photo chosen yet.' : missing ? 'This photo could not be loaded.' : 'Loading photo…'}</div>}
      <div className="nordlys-photo__toolbar" role="group" aria-label="Photo size and position">
        {PHOTO_LAYOUTS.map((item) => <button key={item.value} type="button" title={`${item.label}: ${item.hint}`}
          aria-pressed={layout === item.value} onClick={() => layoutField.setValue(item.value)}>
          <LayoutIcon layout={item.value} /><span>{item.label}</span>
        </button>)}
        <span className="nordlys-photo__actions"><EditButton /><RemoveButton /></span>
      </div>
    </div>
    <input className="nordlys-photo__caption" type="text" value={captionField.value || ''} maxLength={300}
      placeholder="Write a caption (optional)" aria-label="Photo caption"
      onChange={(event) => captionField.setValue(event.target.value)} />
    {!id && <p className="nordlys-photo__help">Use the pencil to choose a photo, or paste or drop a photo into the text instead.</p>}
  </figure>
}
