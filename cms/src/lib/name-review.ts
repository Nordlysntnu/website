// Every name a buyer writes for "Adopt a solar panel" waits for an administrator before it is shown.
// These checks only mark names the reviewer should look at first; they never approve or hide a name.

export type NameReview = 'pending' | 'approved' | 'hidden' | 'none'

export const NAME_REVIEW_OPTIONS: { label: string; value: NameReview }[] = [
  { label: 'Waiting for review', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Hidden', value: 'hidden' },
  { label: 'No name', value: 'none' },
]

/** Admin list of paid adoptions whose name still waits for review. */
export const NAMES_TO_REVIEW_URL =
  '/admin/collections/panel-adoptions?where[and][0][status][equals]=paid&where[and][1][nameReview][equals]=pending'

// Norwegian and international company forms. The short Norwegian ones only count in capitals ("AS", not "as").
const COMPANY_UPPER = /(^|[^\p{L}])(AS|ASA|ANS|DA|ENK|NUF|SA|BA|A\/S)(?![\p{L}])/u
const COMPANY_WORDS = /(^|[^\p{L}])(ltd|limited|inc|llc|gmbh|corp|plc|aps|holding|invest|consult\p{L}*|group|gruppen|eiendom|solutions)(?![\p{L}])|[™®©]|\b\d{9}\b/iu
const CONTACT = /https?:|www\.|@|\b[\p{L}\d-]+\.(no|com|net|org|io|se|dk|eu|app|ai|shop)\b|(\d[\s-]?){8,}/iu

// Rude words and slurs, matched inside words after undoing common letter swaps (f4en, sh1t).
const RUDE = [
  'faen', 'fanden', 'jævl', 'jaevl', 'helvet', 'dritt', 'fitte', 'fitta', 'pikk', 'kukk', 'rasshøl', 'neger', 'pakkis',
  'fuck', 'shit', 'cunt', 'bitch', 'whore', 'asshole', 'bastard', 'nigg', 'faggot', 'retard', 'hitler', 'porn', 'penis', 'vagina', 'wank',
]
// Short words only count on their own, so names like Thoresen, Nazir or Faggruppen are not marked.
const RUDE_WHOLE = /(^|[^\p{L}])(kuk|hore|hora|pule|slut|nazi|dick|cock|sex|cum|tits?|fag|ass|rape)(?![\p{L}])/u
const unswap = (text: string) => text.toLowerCase()
  .replace(/0/g, 'o').replace(/[1!|]/g, 'i').replace(/3/g, 'e').replace(/4|@/g, 'a').replace(/[5$]/g, 's').replace(/7/g, 't')

/** Short reasons a name needs a careful look, e.g. ["Company?", "Rude word?"]. Empty for ordinary names. */
export function nameFlags(name: string | null | undefined): string[] {
  const text = String(name ?? '').trim()
  if (!text) return []
  const flags: string[] = []
  if (COMPANY_UPPER.test(text) || COMPANY_WORDS.test(text)) flags.push('Company?')
  if (CONTACT.test(text)) flags.push('Link or contact details')
  const plain = unswap(text)
  if (RUDE.some(word => plain.includes(word)) || RUDE_WHOLE.test(plain)) flags.push('Rude word?')
  return flags
}

/** The stored text for the admin list: "Company? · Rude word?", or null when nothing stands out. */
export const nameFlagText = (name: string | null | undefined) => nameFlags(name).join(' · ') || null
