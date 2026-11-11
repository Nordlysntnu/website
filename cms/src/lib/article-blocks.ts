import type { Block, Field } from 'payload'

/** Where an inline photo sits in the article. Keep in sync with photoLayouts in src/features/cms/local-posts.mjs. */
export const photoLayoutField: Field = {
  // Not required: photos added before this field existed have no value and must still save.
  name: 'layout', type: 'select', label: 'Photo size and position', defaultValue: 'normal',
  options: [
    { label: 'Normal (text width)', value: 'normal' },
    { label: 'Wide (a bit wider than the text)', value: 'wide' },
    { label: 'Full width (edge to edge)', value: 'full' },
    { label: 'Small, left (text wraps around)', value: 'left' },
    { label: 'Small, right (text wraps around)', value: 'right' },
  ],
  admin: { description: 'Wide and full-width photos make a strong break between sections. Small photos sit beside the text.' },
}

/** Two to four photos side by side inside the article body. */
export const PhotoRowBlock: Block = {
  slug: 'photoRow',
  labels: { singular: 'Photo row', plural: 'Photo rows' },
  fields: [
    {
      name: 'photos', type: 'array', label: 'Photos', labels: { singular: 'Photo', plural: 'Photos' },
      minRows: 2, maxRows: 4, required: true,
      admin: { description: 'Two to four photos shown next to each other. On phones they stack.' },
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Photo' }],
    },
    { name: 'caption', type: 'text', label: 'Caption', maxLength: 300, admin: { description: 'Optional text below the row.' } },
  ],
}
