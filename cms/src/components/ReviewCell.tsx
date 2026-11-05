'use client'
import { reviewLabel } from '../lib/editorial'

export function ReviewCell({ cellData, rowData }: { cellData?: string; rowData?: { _status?: string } }) {
  const published = rowData?._status === 'published'
  return <span className={`editorial-badge editorial-badge--${published ? 'published' : cellData || 'writing'}`}>
    {published ? 'Published' : reviewLabel(cellData)}
  </span>
}
