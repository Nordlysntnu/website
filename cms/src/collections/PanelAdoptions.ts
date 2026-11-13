import type { CollectionConfig, FieldAccess } from 'payload'
import { isAdministrator } from '../access'

const serverOnly: { update: FieldAccess; create: FieldAccess } = { update: () => false, create: () => false }

/** "Adopt a solar panel" orders. Created and updated by the adoption endpoints and Vipps. */
export const PanelAdoptions: CollectionConfig = {
  slug: 'panel-adoptions',
  labels: { singular: 'Panel adoption', plural: 'Panel adoptions' },
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'status', 'panelCount', 'amount', 'displayName', 'createdAt'],
    description: 'Solar panels adopted on the website. Vipps updates the status automatically. Untick "Show name" to hide a name from the website.',
    hidden: ({ user }) => !isAdministrator(user as Parameters<typeof isAdministrator>[0]),
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
    { name: 'displayName', type: 'text', maxLength: 40, admin: { description: 'Name the buyer chose for the panels.' } },
    { name: 'showName', type: 'checkbox', defaultValue: true, admin: { description: 'Untick to hide the name on the website.' } },
    { name: 'vippsState', type: 'text', access: serverOnly, admin: { readOnly: true } },
    { name: 'expiresAt', type: 'date', required: true, index: true, access: serverOnly,
      admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' }, description: 'The panels are held until this time while the buyer pays.' } },
    { name: 'paidAt', type: 'date', access: serverOnly, admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    // Hashed IP address, used to limit how many panels one person can hold at a time.
    { name: 'client', type: 'text', index: true, access: { read: () => false, ...serverOnly }, admin: { hidden: true } },
  ],
}
