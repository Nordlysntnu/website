import { afterPostChange, afterPostDelete } from '../publishing/queue'
import { APIError, type CollectionConfig } from 'payload'
import { isEditor, editorsOnly, editorField, editDraftsOrPublish, publishedOrEditor, publishersOnly, publishField } from '../access'
import { departments } from '../lib/blog'
import { applyReviewWorkflow } from '../lib/review-workflow'

const internalReceipt = { read: editorField, create: () => false, update: () => false }

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Blog post', plural: 'Blog posts' },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'department', 'review', '_status', 'updatedAt'],
    description: 'Write, preview and send for review. Publishers can leave feedback or publish the approved article.',
    components: { beforeList: ['/components/WorkflowLinks#WorkflowLinks'] },
    preview: (data) => `/preview/${data.id ?? 'new'}`,
    livePreview: {
      url: ({ data }) => `/preview/${data.id ?? 'new'}`,
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
        { label: 'Desktop', name: 'desktop', width: 1280, height: 900 },
      ],
    },
  },
  access: {
    create: ({ req, data }) => isEditor(req) && (req.user?.role !== 'marketing' || data?._status !== 'published'),
    read: publishedOrEditor,
    update: editDraftsOrPublish,
    delete: publishersOnly,
    readVersions: ({ req }) => req.user?.role === 'marketing' ? { 'version.ownerId': { equals: req.user.id } } : publishersOnly({ req }),
  },
  versions: { drafts: { autosave: { interval: 1500 } }, maxPerDoc: 30 },
  hooks: {
    afterChange: [afterPostChange], afterDelete: [afterPostDelete],
    beforeOperation: [({ args, operation, req }) => {
      if (req.user?.role === 'marketing' && operation === 'restoreVersion') {
        throw new APIError('Ask a leader to restore a previous version.', 403)
      }
      if (req.user?.role === 'marketing' && (operation === 'create' || operation === 'update')) {
        if (args.data?._status === 'published') {
          throw new APIError('Only a leader can publish a blog post.', 403)
        }
        // Protect the published copy even if a client forgets ?draft=true.
        args.draft = true
        args.data = { ...args.data, _status: 'draft' }
      }
      if (operation === 'create' || operation === 'update') req.context.websiteDraftSave = Boolean(args.draft) && args.data?._status !== 'published'
      return args
    }],
    beforeChange: [({ data, req }) => {
      if (req.user?.role === 'marketing') data._status = 'draft'
      return data
    }, applyReviewWorkflow],
  },
  fields: [
    { name:'legacyKey', type:'text', unique:true, access:{ create:()=>false, update:()=>false }, admin:{hidden:true} },
    {
      name: 'title', type: 'text', required: true,
      label: 'Article title',
      admin: { description: 'The headline shown on the blog card and article page.' },
    },
    { name: 'summary', type: 'textarea', label: 'Short introduction', maxLength: 320,
      admin: { description: 'A short introduction for the blog card and the top of the article. Optional.' } },
    { name: 'coverImage', type: 'upload', relationTo: 'media', label: 'Cover photo',
      admin: { description: 'Shown above the article and on its blog card. If empty, the first gallery or body photo is used.' } },
    { name: 'content', type: 'richText', required: true, label: 'Article body',
      admin: { description: 'Write the article here. Use the toolbar for headings and links. Type / or click + to insert a photo between paragraphs; photos can have captions.' } },
    {
      name: 'gallery', type: 'array', label: 'Photos', labels: { singular: 'Photo', plural: 'Photos' }, maxRows: 12,
      admin: { description: 'Optional photo gallery at the end of the article. Drag rows to change their order.' },
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Photo' }],
    },
    { name: 'authorName', type: 'text', label: 'Author', maxLength: 100,
      admin: { position: 'sidebar', description: 'Public byline. Leave blank if the post is from the whole team.' } },
    { name: 'department', type: 'select', label: 'Group', defaultValue: 'Team',
      options: departments.map((value) => ({ label: value, value })), admin: { position: 'sidebar' } },
    {
      name: 'publishedAt', type: 'date', required: true, label: 'Post date',
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' }, description: 'Only the month and year appear on the blog.' },
    },
    {
      name: 'imageFit', type: 'select', defaultValue: 'contain', required: true,
      options: [{ label: 'Show the whole photo', value: 'contain' }, { label: 'Fill the frame (crop)', value: 'cover' }],
      admin: { hidden: true },
    },
    { name: 'articleChecklist', type: 'ui', admin: { position: 'sidebar', components: { Field: '/components/ArticleChecklist#ArticleChecklist' } } },
    {
      name: 'review', type: 'select', defaultValue: 'writing', required: true,
      label: 'Review',
      options: [{ label: 'In progress', value: 'writing' }, { label: 'Ready for review', value: 'ready' }, { label: 'Changes requested', value: 'changes' }],
      access: { read: editorField },
      admin: { position: 'sidebar', components: { Field: '/components/ReviewAction#ReviewAction', Cell: '/components/ReviewCell#ReviewCell' } },
    },
    { name: 'reviewNote', type: 'textarea', maxLength: 2000, access: { read: editorField, create: publishField, update: publishField }, admin: { hidden: true } },
    { name: 'ownerId', type: 'number', access: internalReceipt, admin: { hidden: true } },
    { name: 'ownerName', type: 'text', access: internalReceipt, admin: { hidden: true } },
    { name: 'reviewerId', type: 'number', access: { read: editorField }, admin: { hidden: true } },
    { name: 'reviewerName', type: 'text', access: internalReceipt, admin: { hidden: true } },
    { name: 'activity', type: 'json', access: internalReceipt, admin: { hidden: true } },
    { name: 'submittedAt', type: 'date', access: internalReceipt, admin: { hidden: true } },
    { name: 'submittedBy', type: 'text', access: internalReceipt, admin: { hidden: true } },
    { name: 'reviewedAt', type: 'date', access: internalReceipt, admin: { hidden: true } },
    { name: 'reviewedBy', type: 'text', access: internalReceipt, admin: { hidden: true } },
    { name: 'lastEditedBy', type: 'text', access: internalReceipt, admin: { hidden: true } },
    {
      name: '_status', type: 'select', label: 'Status', defaultValue: 'draft',
      options: [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }],
      access: { create: publishField, update: publishField },
      admin: { hidden: true },
    },
  ],
}
