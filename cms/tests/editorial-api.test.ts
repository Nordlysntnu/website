import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { test } from 'node:test'
import { getPayload, handleEndpoints } from 'payload'
import { readLocalPosts } from '../../src/features/cms/local-posts.mjs'

// Exercise Payload's real REST handlers, sessions, access rules and SQLite without
// needing a listening Next.js server. Page rendering remains in workflow.test.ts.
process.loadEnvFile('.env.local')
const { default: config } = await import('../src/payload.config')
const payload = await getPayload({ config })
payload.logger.level = 'fatal'
const accounts = JSON.parse(readFileSync('.local/accounts.json', 'utf8'))
const base = 'http://127.0.0.1:3010'
async function request(path: string, token?: string, method = 'GET', data?: unknown) {
  const headers: Record<string, string> = { Origin: base }
  if (token) headers.Authorization = 'JWT ' + token
  if (data) headers['Content-Type'] = 'application/json'
  return handleEndpoints({ config, path: new URL(path, base).pathname,
    request: new Request(base + path, { method, headers, body: data ? JSON.stringify(data) : undefined }) })
}
async function login(role: string) {
  const account = accounts.find((item: { role: string }) => item.role === role)
  const response = await request('/api/users/login', undefined, 'POST', { email: account.email, password: account.password })
  assert.equal(response.status, 200)
  return response.json()
}
const content = { root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: [
  { type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'The workshop test is complete.', detail: 0, format: 0, mode: 'normal', style: '' }] },
] } }

test('editorial REST workflow without a listening server', async (t) => {
  const writer = await login('marketing')
  const publisher = await login('publisher')
  const ids: number[] = []
  let id: number
  let extraPublisherId: number | undefined
  let extraPublisherToken: string
  const draft = () => '/api/posts/' + id + '?draft=true&depth=0'
  const read = async () => (await request(draft(), writer.token)).json()
  const items = async (token: string) => (await (await request('/api/users/notifications', token)).json()).items
  const readAtBefore = (await payload.findByID({ collection: 'users', id: writer.user.id })).notificationsReadAt
  try {
    const password = randomUUID()
    const extra = await payload.create({ collection: 'users', data: {
      name: 'Disposable reviewer', email: 'reviewer-' + randomUUID() + '@example.test', password, role: 'publisher',
    } })
    extraPublisherId = extra.id
    const signedIn = await request('/api/users/login', undefined, 'POST', { email: extra.email, password })
    assert.equal(signedIn.status, 200)
    extraPublisherToken = (await signedIn.json()).token
    await t.test('only authenticated editors can list minimal publisher details', async () => {
      assert.equal((await request('/api/users/reviewers')).status, 403)
      assert.equal((await request('/api/users/notifications')).status, 403)
      const directory = await (await request('/api/users/reviewers', writer.token)).json()
      assert.ok(directory.reviewers.some((user: { id: number }) => user.id === publisher.user.id))
      assert.ok(!directory.reviewers.some((user: { id: number }) => user.id === writer.user.id))
      assert.ok(directory.reviewers.every((user: object) => Object.keys(user).sort().join(',') === 'id,name'))
    })
    await t.test('the server records ownership and rejects forged events and invalid reviewers', async () => {
      const response = await request('/api/posts?draft=true', writer.token, 'POST', {
        title: 'Disposable in-process editorial test', content, reviewerId: publisher.user.id,
        ownerId: publisher.user.id, ownerName: 'Forged', reviewerName: 'Forged',
        activity: [{ id: 'forged', kind: 'published', at: new Date().toISOString(), recipients: [writer.user.id] }],
      })
      assert.equal(response.status, 201, await response.clone().text())
      const { doc } = await response.json(); id = doc.id; ids.push(id)
      assert.equal(doc.ownerId, writer.user.id)
      assert.equal(doc.ownerName, writer.user.name)
      assert.equal(doc.reviewerName, publisher.user.name)
      assert.deepEqual(doc.activity, [])
      for (const reviewerId of [writer.user.id, -1, 9999999, 1.5]) {
        assert.equal((await request(draft(), writer.token, 'PATCH', { reviewerId })).status, 400)
      }
      assert.equal((await request(draft(), publisher.token, 'PATCH', { ownerId: publisher.user.id })).status, 200)
      assert.equal((await read()).ownerId, writer.user.id)
    })
    await t.test('submission notifies the selected reviewer once and retains the shared queue', async () => {
      assert.equal((await request(draft(), writer.token, 'PATCH', { review: 'ready' })).status, 200)
      let doc = await read()
      assert.equal(doc.activity.length, 1)
      assert.deepEqual(doc.activity[0].recipients, [publisher.user.id])
      assert.equal(doc.activity[0].kind, 'submitted')
      assert.ok((await items(publisher.token)).some((item: { postID: number }) => item.postID === id))
      assert.ok(!(await items(writer.token)).some((item: { postID: number }) => item.postID === id))
      assert.ok(!(await items(extraPublisherToken)).some((item: { postID: number }) => item.postID === id))
      const queue = await (await request('/api/posts?draft=true&where[review][equals]=ready', publisher.token)).json()
      assert.ok(queue.docs.some((post: { id: number }) => post.id === id))
      assert.equal((await request(draft(), writer.token, 'PATCH', { summary: 'Autosaved', activity: [] })).status, 200)
      doc = await read(); assert.equal(doc.activity.length, 1)
      assert.equal((await request(draft(), writer.token, 'PATCH', { reviewerId: extraPublisherId })).status, 200)
      doc = await read()
      assert.equal(doc.activity.at(-1).kind, 'assigned')
      assert.deepEqual(doc.activity.at(-1).recipients, [extraPublisherId])
      assert.ok((await items(extraPublisherToken)).some((item: { postID: number }) => item.postID === id))
    })
    await t.test('feedback and publication notify the owner; writers cannot publish or forge read receipts', async () => {
      assert.equal((await request(draft(), writer.token, 'PATCH', { review: 'changes', reviewNote: 'Forged feedback' })).status, 403)
      assert.equal((await request(draft(), publisher.token, 'PATCH', { review: 'changes', reviewNote: 'Add the test date.' })).status, 200)
      // Ordinary autosave must preserve the stored note and not generate another notification.
      const before = (await read()).activity.length
      assert.equal((await request(draft(), writer.token, 'PATCH', { summary: 'Revised introduction' })).status, 200)
      assert.equal((await read()).activity.length, before)
      assert.ok((await items(writer.token)).some((item: { postID: number; message: string }) => item.postID === id && item.message.includes('Changes requested')))
      assert.equal((await request(draft(), writer.token, 'PATCH', { review: 'ready', reviewerId: null })).status, 200)
      assert.equal((await read()).reviewerId, null)
      const sharedEvent = (await read()).activity.at(-1)
      const activePublishers = await payload.find({ collection: 'users', where: { role: { in: ['publisher', 'admin'] }, active: { equals: true } }, pagination: false })
      assert.deepEqual([...sharedEvent.recipients].sort(), activePublishers.docs.map(user => user.id).sort())
      assert.equal((await request('/api/posts/' + id, writer.token, 'PATCH', { _status: 'published' })).status, 403)
      assert.equal((await request('/api/posts/' + id, publisher.token, 'PATCH', { _status: 'published' })).status, 200)
      assert.ok((await items(writer.token)).some((item: { postID: number; message: string }) => item.postID === id && item.message.includes('published')))
      const visible = await (await request('/api/posts/' + id)).json()
      for (const field of ['ownerId', 'ownerName', 'reviewerId', 'reviewerName', 'activity', 'reviewNote']) assert.equal(visible[field], undefined)
      const websitePosts = () => readLocalPosts({
        env: { NODE_ENV: 'development', NEXT_PUBLIC_LOCAL_PREVIEW: 'true' },
        fetcher: async (url, options) => {
          const target = url instanceof Request ? url.url : url
          return handleEndpoints({ config, path: new URL(target).pathname, request: new Request(url, options) })
        },
      })
      const websiteBefore = (await websitePosts())!.find((post) => post.id === id)
      assert.ok(websiteBefore, 'the actual website reader includes the newly published article')
      assert.equal(JSON.stringify(websiteBefore).includes('Add the test date.'), false)
      const old = await (await request('/api/posts/' + id)).json()
      assert.equal((await request(draft(), writer.token, 'PATCH', { title: 'Private later title' })).status, 200)
      assert.equal((await (await request('/api/posts/' + id)).json()).title, old.title)
      assert.equal((await websitePosts())!.find((post) => post.id === id)!.title, old.title,
        'the website reader keeps the published copy while a new revision is private')
      assert.equal((await request('/api/users/' + writer.user.id, writer.token, 'PATCH', { notificationsReadAt: '2999-01-01T00:00:00.000Z' })).status, 200)
      assert.notEqual((await payload.findByID({ collection: 'users', id: writer.user.id })).notificationsReadAt, '2999-01-01T00:00:00.000Z')
    })
    await t.test('read receipts affect only the signed-in user and reject future dates', async () => {
      assert.equal((await request('/api/users/read-notifications', writer.token, 'POST', { through: '2999-01-01' })).status, 400)
      assert.equal((await request('/api/users/read-notifications', undefined, 'POST', { through: new Date().toISOString() })).status, 403)
      const publisherBefore = (await payload.findByID({ collection: 'users', id: publisher.user.id })).notificationsReadAt
      const through = new Date().toISOString()
      const response = await request('/api/users/read-notifications', writer.token, 'POST', { through, id: publisher.user.id })
      assert.equal(response.status, 200, await response.clone().text())
      assert.equal((await response.json()).readAt, through)
      assert.equal((await payload.findByID({ collection: 'users', id: publisher.user.id })).notificationsReadAt, publisherBefore)
    })
  } finally {
    for (const postID of ids) assert.equal((await request('/api/posts/' + postID, publisher.token, 'DELETE')).status, 200)
    if (extraPublisherId) await payload.delete({ collection: 'users', id: extraPublisherId })
    await payload.update({ collection: 'users', id: writer.user.id, data: { notificationsReadAt: readAtBefore || null } })
    await payload.destroy()
  }
})
