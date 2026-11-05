'use client'
import { useEffect, useRef, useState } from 'react'
import type { Media } from '../payload-types'
import styles from '../../../src/shared/styles/BlogEntry.module.css'

export function PhotoGallery({ photos, imageFit }: { photos: Media[]; imageFit?: string | null }) {
  const [selected, setSelected] = useState<number | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (selected !== null && !dialog.current?.open) dialog.current?.showModal()
    if (selected === null && dialog.current?.open) dialog.current?.close()
  }, [selected])
  if (!photos.length) return null
  return <section className="article-gallery" aria-label="Photo gallery">
    <h2>In pictures</h2>
    <div className={styles.imageGrid} data-count={Math.min(photos.length, 4)}>
      {photos.slice(0, 4).map((photo, index) => <button key={`${photo.id}-${index}`} type="button"
        className={`${styles.thumbnailWrapper} ${imageFit !== 'cover' ? styles.uncroppedImages : ''} demo-photo`}
        onClick={() => setSelected(index)} aria-label={`Open photo ${index + 1}: ${photo.alt}`}>
        <img src={photo.url!} alt={photo.alt} />
        {index === 3 && photos.length > 4 && <span className={styles.moreOverlay}>+{photos.length - 4}</span>}
      </button>)}
    </div>
    <dialog className="demo-lightbox" ref={dialog} onCancel={() => setSelected(null)} aria-label="Post photos">
      <button className="demo-close" onClick={() => setSelected(null)} aria-label="Close photos">×</button>
      {selected !== null && photos[selected] && <>
        <img src={photos[selected].url!} alt={photos[selected].alt} />
        <div className="demo-lightbox-controls">
          <button type="button" onClick={() => setSelected((selected + photos.length - 1) % photos.length)}>← Previous</button>
          <span>{selected + 1} / {photos.length}</span>
          <button type="button" onClick={() => setSelected((selected + 1) % photos.length)}>Next →</button>
        </div>
      </>}
    </dialog>
  </section>
}
