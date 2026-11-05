import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { getPayload } from 'payload'
import type { Post } from '../src/payload-types'
import { prepareLocalSchema, prepareAccountGuards } from './prepare-local-schema'

process.loadEnvFile('.env.local')
if (process.env.CMS_ENV === 'production') throw new Error('Demo seeding is disabled in production.')
prepareLocalSchema()
const { default: config } = await import('../src/payload.config')
const { blogs } = await import('../../src/shared/data/blog')
const payload = await getPayload({ config })
prepareLocalSchema()
prepareAccountGuards()
const accounts = JSON.parse(readFileSync('.local/accounts.json', 'utf8'))
for (const account of accounts) {
  const existing = await payload.find({ collection: 'users', where: { email: { equals: account.email } }, limit: 1 })
  if (!existing.docs.length) await payload.create({ collection: 'users', data: account })
}

function richText(text: string) {
  return { root: { type: 'root', direction: 'ltr' as const, format: '' as const, indent: 0, version: 1,
    children: text.split(/\n\n+/).map((paragraph) => ({
      type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0,
      children: [{ type: 'text', version: 1, text: paragraph, detail: 0, format: 0, mode: 'normal', style: '' }],
      textFormat: 0, textStyle: '',
    })),
  } }
}
const title = 'Our first competition — Belgium 2026'
const exists = await payload.find({ collection: 'posts', where: { title: { equals: title } }, limit: 1 })
if (!exists.docs.length) {
  const blog = blogs.find(post => post.images.some(image => image.includes('01-team-belgium')))
  if (!blog) throw new Error('Belgium source article not found; refusing to import a different article under that title.')
  const gallery = []
  for (const [index, image] of blog.images.entries()) {
    const photo = await payload.create({ collection: 'media',
      data: { alt: blog.imageAlts![index] }, filePath: path.resolve('..', 'public', image.slice(1)) })
    gallery.push({ image: photo.id })
  }
  await payload.create({ collection: 'posts', data: {
    title, content: richText(blog.text), gallery, imageFit: 'contain',
    department: 'Team',
    publishedAt: '2026-09-23T12:00:00.000Z', review: 'ready', _status: 'published',
  } })
  await payload.create({ collection: 'posts', draft: true, data: {
    title: 'Demo draft — try editing this',
    content: richText('This is a local draft for trying the editor. Replace this text, add photos and open Live Preview.\n\nWhen you are happy with it, mark it ready for review. A leader can publish it to the local blog.'),
    gallery: [], imageFit: 'contain', publishedAt: new Date().toISOString(), review: 'writing', _status: 'draft',
  } })
}

const articleTitle = 'Article template — tell a story'
const template = await payload.find({ collection: 'posts', draft: true, where: { title: { equals: articleTitle } }, limit: 1 })
if (!template.docs.length) {
  const photos = await payload.find({ collection: 'media', where: { filename: { in: ['01-team-belgium.webp', '03-daytime.webp'] } }, depth: 0, limit: 2 })
  const teamPhoto = photos.docs.find((photo) => photo.filename === '01-team-belgium.webp')
  const racingPhoto = photos.docs.find((photo) => photo.filename === '03-daytime.webp')
  const textNode = (text: string) => ({ type: 'text', version: 1, text, detail: 0, format: 0, mode: 'normal', style: '' })
  const paragraph = (text: string) => ({ type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0, children: [textNode(text)] })
  const heading = (text: string) => ({ type: 'heading', tag: 'h2', version: 1, direction: 'ltr', format: '', indent: 0, children: [textNode(text)] })
  const children: Post['content']['root']['children'] = [
    heading('Start with the story'),
    paragraph('This is a practice article, ready for you to edit. Write about a milestone, introduce a partner or explain what your group has been working on. Start with the most interesting part, then give the reader the details.'),
    heading('Bring the reader into the workshop'),
    paragraph('Use headings to break up a longer story. To insert a photo here, click the + button or type / and choose Upload. Select a photo, add a caption and continue writing below it.'),
  ]
  if (racingPhoto) children.push({ type: 'upload', version: 3, id: randomUUID(), relationTo: 'media', value: racingPhoto.id,
    fields: { caption: 'Lumholtz on track at the ilumen European Solar Challenge in Belgium.' }, format: '' })
  children.push(heading('End with what comes next'), paragraph('Finish with the next step for the team, a thank-you or a link where people can learn more. Use Live Preview to check the whole article on desktop and mobile, then mark it ready for a leader to review.'))
  await payload.create({ collection: 'posts', draft: true, data: {
    title: articleTitle,
    summary: 'A practice article with a headline, introduction, sections and a photo between the paragraphs. Replace this with your own story.',
    coverImage: teamPhoto?.id,
    department: 'Team',
    content: { root: { type: 'root', direction: 'ltr', format: '', indent: 0, version: 1, children } },
    gallery: [], publishedAt: new Date().toISOString(), imageFit: 'contain', review: 'writing', _status: 'draft',
  } })
}
console.log('Demo seeded. Existing content and account passwords were preserved.')
await payload.destroy()
