import type { CollectionConfig } from 'payload'
export const LegacyImports: CollectionConfig = {
  slug: 'legacy-imports', admin: { hidden: true },
  access: { create: () => false, read: () => false, update: () => false, delete: () => false },
  fields: [
    { name: 'key', type: 'text', required: true, unique: true },
    { name: 'postId', type: 'number', required: true },
  ],
}
