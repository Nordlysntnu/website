import type { CollectionConfig, FieldAccess } from 'payload'
import { isAdministrator } from '../access'
import { NAME_REVIEW_OPTIONS, nameFlagText } from '../lib/name-review'

const serverOnly: { update: FieldAccess; create: FieldAccess } = { update: () => false, create: () => false }

/** "Adopt a solar panel" orders. Created and updated by the adoption endpoints and Vipps. */
export const PanelAdoptions: CollectionConfig = {
  slug: 'panel-adoptions',
  labels: { singular: 'Panel adoption', plural: 'Panel adoptions' },
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['displayName', 'nameReview', 'nameFlags', 'status', 'panelCount', 'amount', 'createdAt'],
    description: 'Solar panels adopted on the website. Vipps updates the status automatically. A name is shown on the website only after you set "Name review" to Approved. Choose Hidden for names that are rude, a company or an ad; the panels stay adopted without a name. The terms (/terms, section 2) promise the money back when we refuse a name: refund the payment in the Vipps business portal. The dashboard links to the names waiting for review. To approve several at once, tick them in the list and use Edit.',
    hidden: ({ user }) => !isAdministrator(user as Parameters<typeof isAdministrator>[0]),
  },
  hooks: {
    // Keep the flags right when an administrator corrects a name.
    beforeChange: [({ data, originalDoc }) => {
      if (data && 'displayName' in data && data.displayName !== originalDoc?.displayName) data.nameFlags = nameFlagText(data.displayName)
      return data
    }],
  },
  access: {
    read: ({ req }) => isAdministrator(req.user),
    update: ({ req }) => isAdministrator(req.user),
    create: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'reference', type: 'text', required: true, unique: true, index: true, access: serverOnly, admin: { readOnly: true } },
    { name: 'status', type: 'select', required: true, defaultValue: 'pending', index: true, access: serverOnly, admin: { readOnly: true },
      options: [
        { label: 'Waiting for payment', value: 'pending' },
        { label: 'Authorized, not captured', value: 'authorized' },
        { label: 'Paid', value: 'paid' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Failed', value: 'failed' },
      ] },
    { name: 'panels', type: 'json', required: true, access: serverOnly, admin: { readOnly: true } },
    { name: 'panelCount', type: 'number', required: true, access: serverOnly, admin: { readOnly: true } },
    { name: 'amount', type: 'number', required: true, access: serverOnly, admin: { readOnly: true, description: 'Whole kroner.' } },
    { name: 'displayName', type: 'text', maxLength: 40, admin: { description: 'Name the buyer chose for the panels. You may correct the spelling.' } },
    { name: 'nameReview', label: 'Name review', type: 'select', required: true, defaultValue: 'pending', index: true, options: NAME_REVIEW_OPTIONS,
      admin: { description: 'Only Approved names are shown on the website.' } },
    { name: 'nameFlags', label: 'Check', type: 'text', access: serverOnly,
      admin: { readOnly: true, description: 'Why the name may need a careful look (company, link, rude word). Empty for ordinary names.' } },
    // The buyer's own choice. The adopt page always sends true; kept for old orders.
    { name: 'showName', type: 'checkbox', defaultValue: true, access: serverOnly, admin: { hidden: true } },
    { name: 'email', type: 'email', admin: { description: 'Optional. Only to thank the buyer and send news about the car; never shown on the website. Clear it if the buyer asks.' } },
    { name: 'vippsState', type: 'text', access: serverOnly, admin: { readOnly: true } },
    { name: 'expiresAt', type: 'date', required: true, index: true, access: serverOnly,
      admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' }, description: 'The panels are held until this time while the buyer pays.' } },
    { name: 'paidAt', type: 'date', access: serverOnly, admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    // Hashed IP address, used to limit how many panels one person can hold at a time.
    { name: 'client', type: 'text', index: true, access: { read: () => false, ...serverOnly }, admin: { hidden: true } },
  ],
}
