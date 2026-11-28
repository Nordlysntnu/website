// Sharing a published article: its public address and a ready text for a LinkedIn post.

export const DEFAULT_WEBSITE_URL = 'https://www.nordlysntnu.no'
export const SHARE_HASHTAGS = '#NordlysNTNU #SolarCar #NTNU'

/** The article's address on the website: its legacy key for imported stories, otherwise its number. */
export function articleURL(websiteURL: string | undefined, legacyKey: unknown, id: string | number) {
  const base = (websiteURL || DEFAULT_WEBSITE_URL).replace(/\/+$/, '')
  const slug = typeof legacyKey === 'string' && /^legacy-[a-f0-9]{20}$/.test(legacyKey) ? legacyKey : String(id)
  return `${base}/blog/${slug}`
}

/** Title, introduction, link and hashtags, separated by blank lines. Writers can edit it in LinkedIn. */
export function linkedInText({ title, summary, url }: { title?: string | null; summary?: string | null; url: string }) {
  return [title?.trim(), summary?.trim(), `Read the whole story: ${url}`, SHARE_HASHTAGS].filter(Boolean).join('\n\n')
}

export const linkedInShareURL = (url: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
