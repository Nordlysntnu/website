import type { GlobalConfig } from 'payload'
export const WebsitePublication: GlobalConfig = {
  slug: 'website-publication', admin: { hidden: true },
  access: { read: () => false, update: () => false },
  fields: [
    { name:'appliedHash', type:'text' }, { name:'releaseId', type:'text' },
    { name:'succeededAt', type:'date' }, { name:'failedAt', type:'date' },
    { name:'failedHash', type:'text' }, { name:'error', type:'text' }, { name:'mode', type:'text' },
  ],
}
