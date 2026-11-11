import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { articleStarters, starterData } from '../src/lib/article-starters'

const base = 'http://127.0.0.1:3010'
const accounts = JSON.parse(readFileSync('.local/accounts.json', 'utf8'))
const content = (text: string) => ({ root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0,
  children: [{ type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0,
    children: [{ type: 'text', version: 1, text, detail: 0, format: 0, mode: 'normal', style: '' }] }] } })

async function request(path: string, token?: string, method = 'GET', data?: unknown) {
  const headers: Record<string, string> = { Origin: base }
  if (token) headers.Authorization = `JWT ${token}`
  if (data && !(data instanceof FormData)) headers['Content-Type'] = 'application/json'
  return fetch(`${base}${path}`, { method, headers, redirect: 'manual', signal: AbortSignal.timeout(45000),
    body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined })
}
async function login(role: string) {
  const account = accounts.find((item: { role: string }) => item.role === role)
  const response = await request('/api/users/login', undefined, 'POST', { email: account.email, password: account.password })
  assert.equal(response.status, 200, `${role} can sign in`)
  return response.json()
}
const denied = (status: number) => assert.ok([401, 403, 404].includes(status), `expected access denied, got ${status}`)

test('local CMS editing and publishing permissions', async (t) => {
  const marketing = await login('marketing')
  const leader = await login('publisher')
  let postID: number | undefined
  let photoID: number | undefined
  let photoURL = ''
  const extraPhotos: { id: number; url: string }[] = []
  try {
    await t.test('anonymous visitors see published posts, not drafts or version history', async () => {
      const response = await request('/api/posts?draft=true&depth=0')
      assert.equal(response.status, 200)
      const data = await response.json()
      assert.ok(data.docs.some((post: { title: string }) => post.title.includes('Belgium')))
      assert.ok(data.docs.every((post: { _status: string }) => post._status === 'published'))
      const galleryPhotoID = data.docs.find((post: { gallery?: { image: number }[] }) => post.gallery?.length)?.gallery[0].image
      if (galleryPhotoID) assert.equal((await request(`/api/media/${galleryPhotoID}`)).status, 200)
      denied((await request('/api/posts/versions')).status)
      denied((await request('/api/posts', undefined, 'POST', { title: 'Unauthorized' })).status)
    })
    await t.test('marketing cannot change its role or create another account', async () => {
      const response = await request(`/api/users/${marketing.user.id}`, marketing.token, 'PATCH', { role: 'publisher' })
      assert.equal(response.status, 200)
      const me = await (await request('/api/users/me', marketing.token)).json()
      assert.equal(me.user.role, 'marketing')
      denied((await request('/api/users', marketing.token, 'POST', { email: 'extra@example.test', password: 'unused' })).status)
    })
    await t.test('draft photos are private and unsupported upload types are rejected', async () => {
      const form = new FormData()
      form.set('_payload', JSON.stringify({ alt: 'Disposable workflow test photo' }))
      form.set('file', new Blob([readFileSync('../public/blog/iesc-2026/03-daytime.webp')], { type: 'image/webp' }), 'workflow-test.webp')
      const response = await request('/api/media', marketing.token, 'POST', form)
      assert.equal(response.status, 201)
      const { doc } = await response.json()
      photoID = doc.id
      photoURL = new URL(doc.url, base).pathname
      denied((await request(`/api/media/${photoID}`)).status)
      denied((await request(photoURL)).status)
      for (const name of ['cover', 'body']) {
        const image = new FormData()
        image.set('_payload', JSON.stringify({ alt: `Disposable ${name} test photo` }))
        image.set('file', new Blob([readFileSync('../public/blog/iesc-2026/03-daytime.webp')], { type: 'image/webp' }), `workflow-${name}.webp`)
        const uploaded = await request('/api/media', marketing.token, 'POST', image)
        assert.equal(uploaded.status, 201)
        const { doc: media } = await uploaded.json()
        extraPhotos.push({ id: media.id, url: new URL(media.url, base).pathname })
        denied((await request(extraPhotos.at(-1)!.url)).status)
      }
      const invalid = new FormData()
      invalid.set('_payload', JSON.stringify({ alt: 'Rejected file' }))
      invalid.set('file', new Blob(['<svg xmlns="http://www.w3.org/2000/svg"></svg>'], { type: 'image/svg+xml' }), 'not-allowed.svg')
      assert.equal((await request('/api/media', marketing.token, 'POST', invalid)).status, 400)
    })
    await t.test('marketing can save a draft without making it public', async () => {
      const body = content('Unpublished test text')
      const nodes: Record<string, unknown>[] = body.root.children
      nodes.push({ type: 'heading', version: 1, tag: 'h2', direction: 'ltr', format: '', indent: 0,
        children: [{ type: 'text', version: 1, text: 'How we test', detail: 0, format: 0, mode: 'normal', style: '' }] },
      { type: 'upload', version: 3, id: 'workflow-inline-image', relationTo: 'media', value: extraPhotos[1].id,
        fields: { caption: 'Inline photo caption' }, format: '' },
      ...content('Text after the inline photo').root.children)
      const response = await request('/api/posts', marketing.token, 'POST', {
        title: 'Disposable workflow test', content: body, summary: 'A short introduction to our test article.',
        authorName: 'Demo author', department: 'Software', coverImage: extraPhotos[0].id,
        gallery: [{ image: photoID }], publishedAt: '2026-10-01T12:00:00.000Z', imageFit: 'contain', review: 'ready',
      })
      assert.equal(response.status, 201)
      const { doc } = await response.json()
      postID = doc.id
      assert.equal(doc._status, 'draft')
      denied((await request(`/api/posts/${postID}`)).status)
      const preview = await request(`/preview/${postID}`)
      assert.equal(preview.status, 307)
      assert.match(preview.headers.get('location') || '', /admin\/login/)
      const article = await request(`/blog/${postID}`)
      assert.equal(article.status, 404)
      assert.doesNotMatch(await article.text(), /Disposable workflow test|Unpublished test text/)
      assert.equal((await request(`/preview/${postID}`, marketing.token)).status, 200)
    })
    await t.test('marketing cannot publish through create, update or bulk update', async () => {
      denied((await request('/api/posts', marketing.token, 'POST', { title: 'Blocked publish', _status: 'published' })).status)
      denied((await request(`/api/posts/${postID}`, marketing.token, 'PATCH', { _status: 'published' })).status)
      const response = await request(`/api/posts?where[id][equals]=${postID}`, marketing.token, 'PATCH', { _status: 'published' })
      if (response.status === 200) {
        const result = await response.json()
        assert.ok(result.errors?.length, 'bulk operation reports denied edits')
      } else denied(response.status)
      denied((await request(`/api/posts/${postID}`)).status)
    })
    await t.test('a leader publishes the reviewed draft and its photos', async () => {
      const response = await request(`/api/posts/${postID}`, leader.token, 'PATCH', { _status: 'published' })
      assert.equal(response.status, 200)
      const published = await (await request(`/api/posts/${postID}`)).json()
      assert.equal(published._status, 'published')
      assert.match(JSON.stringify(published.content), /Unpublished test text/)
      assert.equal((await request(photoURL)).status, 200)
      for (const photo of extraPhotos) assert.equal((await request(photo.url)).status, 200)
    })
    await t.test('the article page renders a headline, author, group, introduction and inline caption', async () => {
      const response = await request(`/blog/${postID}`)
      assert.equal(response.status, 200)
      const html = await response.text()
      assert.match(html, /<h1>Disposable workflow test<\/h1>/)
      assert.match(html, /Demo author/)
      assert.match(html, /Software/)
      assert.match(html, /A short introduction to our test article/)
      assert.match(html, /<h2[^>]*>How we test<\/h2>/)
      assert.match(html, /<figcaption>Inline photo caption<\/figcaption>/)
      assert.match(html, /Text after the inline photo/)
      const index = await (await request('/blog')).text()
      assert.match(index, new RegExp(`href="/blog/${postID}"`))
      assert.match(index, /Search articles/)
    })
    await t.test('editing a published post as marketing preserves the published copy', async () => {
      const response = await request(`/api/posts/${postID}`, marketing.token, 'PATCH', { content: content('New PRIVATE revision') })
      assert.equal(response.status, 200)
      const published = await (await request(`/api/posts/${postID}`)).json()
      assert.match(JSON.stringify(published.content), /Unpublished test text/)
      assert.doesNotMatch(JSON.stringify(published.content), /PRIVATE/)
      const drafts = await (await request(`/api/posts/${postID}?draft=true`, leader.token)).json()
      assert.match(JSON.stringify(drafts.content), /PRIVATE/)
      const anonymousDraft = await request(`/api/posts/${postID}?draft=true`)
      if (anonymousDraft.ok) assert.doesNotMatch(JSON.stringify(await anonymousDraft.json()), /PRIVATE/)
      else denied(anonymousDraft.status)
    })
    await t.test('marketing cannot replace a published photo or delete the post', async () => {
      denied((await request(`/api/media/${photoID}`, marketing.token, 'PATCH', { alt: 'Unreviewed change' })).status)
      for (const photo of extraPhotos) denied((await request(`/api/media/${photo.id}`, marketing.token, 'PATCH', { alt: 'Unreviewed change' })).status)
      denied((await request(`/api/posts/${postID}`, marketing.token, 'DELETE')).status)
      denied((await request(`/api/media/${photoID}`, leader.token, 'DELETE')).status)
    })
    await t.test('history is available but marketing cannot restore a published version', async () => {
      const response = await request(`/api/posts/versions?where[parent][equals]=${postID}`, marketing.token)
      assert.equal(response.status, 200)
      const versions = await response.json()
      assert.ok(versions.docs.length >= 3)
      denied((await request(`/api/posts/versions/${versions.docs[0].id}`, marketing.token, 'POST', {})).status)
    })
    await t.test('publishing a later revision updates the local blog and unpublishing hides it', async () => {
      assert.equal((await request(`/api/posts/${postID}`, leader.token, 'PATCH', { _status: 'published' })).status, 200)
      const blog = await (await request(`/blog/${postID}`)).text()
      assert.match(blog, /New PRIVATE revision/)
      assert.match(blog, /October 2026/)
      denied((await request(extraPhotos[1].url)).status)
      assert.equal((await request(`/api/posts/${postID}`, leader.token, 'PATCH', { _status: 'draft' })).status, 200)
      denied((await request(`/api/posts/${postID}`)).status)
      denied((await request(photoURL)).status)
      for (const photo of extraPhotos) denied((await request(photo.url)).status)
      assert.equal((await request(`/blog/${postID}`)).status, 404)
    })
  } finally {
    if (postID) await request(`/api/posts/${postID}`, leader.token, 'DELETE')
    if (photoID) await request(`/api/media/${photoID}`, leader.token, 'DELETE')
    for (const photo of extraPhotos) await request(`/api/media/${photo.id}`, leader.token, 'DELETE')
  }
})

test('editorial inbox, article starters and private review feedback', async (t) => {
  const writer = await login('marketing')
  const publisher = await login('publisher')
  const disposableIDs: number[] = []
  let postID: number
  const note = 'Please confirm the lap count and add a short explanation of the electrical changes.'
  const draftPath = () => `/api/posts/${postID}?draft=true&depth=0`
  const readDraft = async () => (await request(draftPath(), writer.token)).json()
  try {
    await t.test('all starters create private drafts and unfinished prompts cannot be reviewed or published', async () => {
      for (const starter of articleStarters) {
        const response = await request('/api/posts?draft=true', writer.token, 'POST', starterData(starter.id))
        assert.equal(response.status, 201)
        const { doc } = await response.json()
        disposableIDs.push(doc.id)
        postID = doc.id
        assert.equal(doc.review, 'writing')
        assert.equal(doc.lastEditedBy, writer.user.name)
        denied((await request(`/api/posts/${postID}`)).status)
        const incomplete = await request(draftPath(), writer.token, 'PATCH', { review: 'ready' })
        assert.equal(incomplete.status, 400)
        assert.match(await incomplete.text(), /Replace the template prompts/)
        assert.equal((await request(`/api/posts/${postID}`, publisher.token, 'PATCH', { _status: 'published' })).status, 400)
      }
    })
    await t.test('empty articles stay editable but cannot be sent for review', async () => {
      const response = await request(draftPath(), writer.token, 'PATCH', { title: 'Workflow review fixture', content: content('') })
      assert.equal(response.status, 200)
      assert.equal((await request(draftPath(), writer.token, 'PATCH', { review: 'ready' })).status, 400)
      assert.equal((await request(draftPath(), writer.token, 'PATCH', {
        content: content('Our electrical team tested the battery monitoring system at the workshop.'), department: 'Electrical', review: 'ready',
        submittedBy: 'Forged name', submittedAt: '2000-01-01T00:00:00.000Z',
      })).status, 200)
      const post = await readDraft()
      assert.equal(post.submittedBy, writer.user.name)
      assert.ok(Date.parse(post.submittedAt) > Date.parse('2026-01-01'))
    })
    await t.test('the authenticated overview and ready filter include the submitted draft', async () => {
      const queue = await (await request('/api/posts?draft=true&where[and][0][_status][equals]=draft&where[and][1][review][equals]=ready', publisher.token)).json()
      assert.ok(queue.docs.some((post: { id: number }) => post.id === postID))
      const overview = await request('/admin', publisher.token)
      assert.equal(overview.status, 200)
      const html = await overview.text()
      assert.match(html, /Editorial workspace|EDITORIAL WORKSPACE/)
      assert.match(html, /Workflow review fixture/)
      assert.match(html, /Create a private draft/)
    })
    await t.test('only a publisher can return an article, and feedback is required', async () => {
      denied((await request(draftPath(), writer.token, 'PATCH', { review: 'changes', reviewNote: note })).status)
      assert.equal((await request(draftPath(), publisher.token, 'PATCH', { review: 'changes' })).status, 400)
      assert.equal((await request(draftPath(), publisher.token, 'PATCH', { review: 'changes', reviewNote: '   ' })).status, 400)
      assert.equal((await request(draftPath(), publisher.token, 'PATCH', { review: 'changes', reviewNote: 'x'.repeat(2001) })).status, 400)
      assert.equal((await request(draftPath(), publisher.token, 'PATCH', { review: 'changes', reviewNote: note })).status, 200)
      const post = await readDraft()
      assert.equal(post.review, 'changes')
      assert.equal(post.reviewNote, note)
      assert.equal(post.reviewedBy, publisher.user.name)
      assert.ok(Date.parse(post.reviewedAt))
      const overview = await (await request('/admin', writer.token)).text()
      assert.match(overview, /Please confirm the lap count/)
    })
    await t.test('writers can revise and resubmit but cannot erase feedback or forge reviewer receipts', async () => {
      assert.equal((await request(draftPath(), writer.token, 'PATCH', {
        title: 'Electrical workshop update', content: content('We verified the battery monitoring readings against the reference sensors.'),
        review: 'ready', reviewNote: 'Erased', reviewedBy: 'Fake reviewer', reviewedAt: '2000-01-01T00:00:00.000Z',
      })).status, 200)
      const post = await readDraft()
      assert.equal(post.review, 'ready')
      assert.equal(post.reviewNote, note)
      assert.equal(post.reviewedBy, publisher.user.name)
      assert.equal(post.submittedBy, writer.user.name)
      denied((await request(`/api/posts/${postID}`)).status)
    })
    await t.test('publishing clears the inbox and never exposes review notes or internal receipts', async () => {
      assert.equal((await request(`/api/posts/${postID}`, publisher.token, 'PATCH', { _status: 'published' })).status, 200)
      const visible = await (await request(`/api/posts/${postID}`)).json()
      for (const field of ['review', 'reviewNote', 'submittedAt', 'submittedBy', 'reviewedAt', 'reviewedBy', 'lastEditedBy']) assert.equal(visible[field], undefined, `${field} is private`)
      const html = await (await request(`/blog/${postID}`)).text()
      assert.match(html, /Electrical workshop update/)
      assert.doesNotMatch(html, /Please confirm the lap count|reviewNote|reviewedBy/)
      const queue = await (await request('/api/posts?draft=true&where[review][equals]=ready', publisher.token)).json()
      assert.ok(!queue.docs.some((post: { id: number }) => post.id === postID))
      const draft = await readDraft()
      assert.equal(draft.reviewNote, note)
      assert.equal(draft.reviewedBy, publisher.user.name)
      assert.equal(draft.lastEditedBy, publisher.user.name)
    })
  } finally {
    for (const id of disposableIDs) {
      const response = await request(`/api/posts/${id}`, publisher.token, 'DELETE')
      assert.equal(response.status, 200, 'Disposable editorial test post is cleaned up')
    }
  }
})


test('reviewer assignment, personal articles and private notifications', async (t) => {
  const writer = await login('marketing')
  const publisher = await login('publisher')
  const ids: number[] = []
  let id: number
  const draft = () => '/api/posts/' + id + '?draft=true&depth=0'
  const read = async () => (await request(draft(), writer.token)).json()
  const notifications = async (token: string) => (await (await request('/api/users/notifications', token)).json()).items
  try {
    await t.test('reviewer directory contains publishers and exposes no account details', async () => {
      denied((await request('/api/users/reviewers')).status)
      denied((await request('/api/users/notifications')).status)
      const result = await (await request('/api/users/reviewers', writer.token)).json()
      assert.ok(result.reviewers.some((item: { id: number }) => item.id === publisher.user.id))
      assert.ok(!result.reviewers.some((item: { id: number }) => item.id === writer.user.id))
      assert.ok(result.reviewers.every((item: object) => Object.keys(item).sort().join(',') === 'id,name'))
    })
    await t.test('ownership and notification events cannot be supplied by a client', async () => {
      const response = await request('/api/posts?draft=true', writer.token, 'POST', {
        title: 'Personal article routing fixture', content: content('Our group has completed the next workshop test.'),
        reviewerId: publisher.user.id, ownerId: publisher.user.id, ownerName: 'Forged owner',
        reviewerName: 'Forged reviewer', activity: [{ id: 'forged', kind: 'published', at: new Date().toISOString(), recipients: [writer.user.id] }],
      })
      assert.equal(response.status, 201)
      const { doc } = await response.json(); id = doc.id; ids.push(id)
      assert.equal(doc.ownerId, writer.user.id)
      assert.equal(doc.ownerName, writer.user.name)
      assert.equal(doc.reviewerId, publisher.user.id)
      assert.equal(doc.reviewerName, publisher.user.name)
      assert.deepEqual(doc.activity, [])
      assert.equal((await request(draft(), publisher.token, 'PATCH', { ownerId: publisher.user.id, title: 'Personal article routing fixture' })).status, 200)
      assert.equal((await read()).ownerId, writer.user.id)
    })
    await t.test('invalid reviewers are rejected and every ready article stays in the shared queue', async () => {
      for (const reviewerId of [writer.user.id, 99999999, -1, 1.5]) {
        assert.equal((await request(draft(), writer.token, 'PATCH', { reviewerId })).status, 400)
      }
      assert.equal((await request(draft(), writer.token, 'PATCH', { review: 'ready' })).status, 200)
      const post = await read()
      assert.equal(post.activity.length, 1)
      assert.deepEqual(post.activity[0].recipients, [publisher.user.id])
      assert.equal(post.activity[0].kind, 'submitted')
      const shared = await (await request('/api/posts?draft=true&where[review][equals]=ready', publisher.token)).json()
      assert.ok(shared.docs.some((post: { id: number }) => post.id === id))
      assert.ok((await notifications(publisher.token)).some((item: { postID: number }) => item.postID === id))
      assert.ok(!(await notifications(writer.token)).some((item: { postID: number }) => item.postID === id))
      assert.equal((await request(draft(), writer.token, 'PATCH', { summary: 'Another autosave', activity: [] })).status, 200)
      assert.equal((await read()).activity.length, 1, 'ordinary saves do not duplicate or erase notifications')
    })
    await t.test('my articles are personal and the dashboard shows assigned reviews', async () => {
      const response = await request('/api/posts?draft=true', publisher.token, 'POST', {
        title: 'Publisher-only personal fixture', content: content('A separate personal story.'),
      })
      assert.equal(response.status, 201); ids.push((await response.json()).doc.id)
      assert.equal((await request('/my-posts')).status, 307)
      const own = await (await request('/my-posts', writer.token)).text()
      assert.match(own, /Personal article routing fixture/)
      assert.doesNotMatch(own, /Publisher-only personal fixture/)
      assert.match(own, /Waiting for review/)
      const other = await (await request('/my-posts', publisher.token)).text()
      assert.match(other, /Publisher-only personal fixture/)
      assert.doesNotMatch(other, /Personal article routing fixture/)
      const overview = await (await request('/admin', publisher.token)).text()
      assert.match(overview, /Assigned to you/)
      assert.match(overview, /Personal article routing fixture/)
    })
    await t.test('feedback and publishing notify the owner; public APIs expose no routing or events', async () => {
      assert.equal((await request(draft(), publisher.token, 'PATCH', { review: 'changes', reviewNote: 'Please add the test date.' })).status, 200)
      let mine = await notifications(writer.token)
      assert.ok(mine.some((item: { postID: number; message: string }) => item.postID === id && item.message.includes('Changes requested')))
      assert.equal((await request(draft(), writer.token, 'PATCH', { review: 'ready', reviewerId: null })).status, 200)
      assert.equal((await read()).reviewerId, null)
      assert.equal((await request('/api/posts/' + id, publisher.token, 'PATCH', { _status: 'published' })).status, 200)
      mine = await notifications(writer.token)
      assert.ok(mine.some((item: { postID: number; message: string }) => item.postID === id && item.message.includes('published')))
      const visible = await (await request('/api/posts/' + id)).json()
      for (const field of ['ownerId', 'ownerName', 'reviewerId', 'reviewerName', 'activity']) assert.equal(visible[field], undefined, field + ' stays private')
      const own = await (await request('/my-posts', writer.token)).text()
      assert.match(own, /View published article/)
      assert.match(own, /Please add the test date/)
      assert.equal((await request('/api/users/read-notifications', writer.token, 'POST', { through: '2999-01-01' })).status, 400)
      denied((await request('/api/users/read-notifications', undefined, 'POST', { through: new Date().toISOString() })).status)
      // A regular API client cannot forge the protected read receipt.
      assert.equal((await request('/api/users/' + writer.user.id, writer.token, 'PATCH', { notificationsReadAt: '2999-01-01T00:00:00.000Z' })).status, 200)
      const me = await (await request('/api/users/me', writer.token)).json()
      assert.notEqual(me.user.notificationsReadAt, '2999-01-01T00:00:00.000Z')
    })
  } finally {
    for (const postID of ids) assert.equal((await request('/api/posts/' + postID, publisher.token, 'DELETE')).status, 200)
  }
})
