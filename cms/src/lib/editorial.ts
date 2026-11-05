// Shared by the editor checklist and the server-side review/publish checks.
// Keep this module free of server-only imports.
export function articleText(value: unknown): string {
  if (!value || typeof value !== 'object') return ''
  if (Array.isArray(value)) return value.map(articleText).filter(Boolean).join(' ')
  const node = value as Record<string, unknown>
  if (node.type === 'text' && typeof node.text === 'string') return node.text
  return articleText(node.root || node.children)
}

export function articleReadiness(post: { title?: unknown; content?: unknown }) {
  const title = typeof post.title === 'string' ? post.title.trim() : ''
  const body = articleText(post.content).trim()
  const prompts = /\[Write [^\]]*\]/i.test(`${title} ${body}`)
  return [
    { key: 'title', label: 'Add an article title', complete: Boolean(title), required: true },
    { key: 'body', label: 'Write the article', complete: Boolean(body), required: true },
    { key: 'prompts', label: 'Replace the template prompts', complete: !prompts, required: true },
  ]
}

export function reviewLabel(value?: string | null) {
  return value === 'ready' ? 'Ready for review' : value === 'changes' ? 'Changes requested' : 'In progress'
}

export function editorialDate(value?: string | null) {
  if (!value || Number.isNaN(Date.parse(value))) return ''
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'Europe/Oslo' }).format(new Date(value))
}
