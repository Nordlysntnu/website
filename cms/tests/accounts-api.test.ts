import assert from 'node:assert/strict'
import { test } from 'node:test'
import { randomUUID, randomBytes } from 'node:crypto'
import { mkdir, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { getPayload, handleEndpoints } from 'payload'
import sharp from 'sharp'

const dataDir = path.resolve('.local/tests/accounts-' + randomUUID())
await mkdir(dataDir, { recursive: true, mode: 0o700 })
Object.assign(process.env, {
  CMS_ENV: 'local', CMS_URL: 'http://127.0.0.1:3010', NODE_ENV: 'test',
  PAYLOAD_SECRET: randomBytes(48).toString('hex'), CMS_DATA_DIR: dataDir,
  DATABASE_URL: 'file:' + path.join(dataDir, 'cms.db').replaceAll('\\', '/'), CMS_SCHEMA_PUSH: 'false',
})
const { default: config } = await import('../src/payload.config')
const payload = await getPayload({ config })
payload.logger.level = 'fatal'
const base = 'http://127.0.0.1:3010'
async function request(url: string, token?: string, method = 'GET', body?: unknown) {
  const headers: Record<string, string> = { Origin: base }
  if (token) headers.Authorization = 'JWT ' + token
  if (body) headers['Content-Type'] = 'application/json'
  return handleEndpoints({ config, path: new URL(url, base).pathname, request: new Request(base + url,
    { method, headers, body: body ? JSON.stringify(body) : undefined }) })
}
const password = 'A long disposable test password ' + randomUUID()
async function account(role: 'marketing' | 'publisher' | 'admin', name: string) {
  const doc = await payload.create({ collection: 'users', overrideAccess: true, context: { accountProvisioning: true },
    data: { name, email: randomUUID() + '@example.test', password, role, active: true } })
  const response = await request('/api/users/login', undefined, 'POST', { email: doc.email, password })
  assert.equal(response.status, 200, await response.clone().text())
  return { ...doc, token: (await response.json()).token as string }
}
const content = { root: { type: 'root', version: 1, direction: 'ltr' as const, format: '' as const, indent: 0,
  children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'A real article for the access tests.',
    detail: 0, format: 0, mode: 'normal', style: '' }] }] } }

test('accounts, invitations and private drafts through real Payload REST handlers', async (t) => {
  try {
    await payload.db.migrate()
    await payload.db.migrate()
    await t.test('health checks disclose no account details', async () => {
      const response = await request('/api/health')
      assert.equal(response.status, 200)
      assert.deepEqual(await response.json(), { status: 'ok' })
    })
    await t.test('an empty production-style database cannot be claimed through first-register', async () => {
      const response = await request('/api/users/first-register', undefined, 'POST', {
        email: 'uninvited@example.test', password, name: 'Uninvited', role: 'admin', context: { accountProvisioning: true },
      })
      assert.equal(response.status, 403, await response.clone().text())
      assert.equal((await payload.count({ collection: 'users' })).totalDocs, 0)
    })
    const admin = await account('admin', 'First administrator')
    const secondAdmin = await account('admin', 'Second administrator')
    const writer = await account('marketing', 'First writer')
    const other = await account('marketing', 'Other writer')
    const publisher = await account('publisher', 'Reviewer')
    let invitation: { id: number; email: string; token: string; setupToken: string }

    await t.test('only administrators may invite; ordinary API registration stays closed', async () => {
      const body = { name: 'Invited writer', email: randomUUID() + '@example.test', role: 'marketing' }
      for (const token of [undefined, writer.token, publisher.token]) {
        assert.equal((await request('/api/users/invite', token, 'POST', body)).status, 403)
      }
      assert.equal((await request('/api/users', admin.token, 'POST', { ...body, password })).status, 403)
      const result = await request('/api/users/invite', admin.token, 'POST', body)
      assert.equal(result.status, 201, await result.clone().text())
      const value = await result.json()
      assert.equal(value.token, undefined); assert.equal(value.password, undefined)
      const messages = await readdir(path.join(dataDir, 'outbox'))
      assert.equal(messages.length, 1)
      const mail = JSON.parse(await readFile(path.join(dataDir, 'outbox', messages[0]), 'utf8'))
      assert.equal(mail.to, body.email)
      const link = String(mail.html).match(/href="([^"]+)"/)![1]
      assert.equal(new URL(link).origin, base)
      invitation = { id: value.id, email: body.email, token: '', setupToken: decodeURIComponent(new URL(link).pathname.split('/').pop()!) }
      assert.equal((await request('/api/users/invite', admin.token, 'POST', body)).status, 409)
    })
    await t.test('password setup validates length and consumes the emailed token once', async () => {
      for (const weakPassword of ['', null, 'short']) {
        const weak = await request('/api/users/reset-password', undefined, 'POST', { token: invitation.setupToken, password: weakPassword })
        assert.equal(weak.status, 400, await weak.clone().text())
      }
      const accepted = await request('/api/users/reset-password', undefined, 'POST', { token: invitation.setupToken, password })
      assert.equal(accepted.status, 200, await accepted.clone().text())
      invitation.token = (await accepted.json()).token
      const again = await request('/api/users/reset-password', undefined, 'POST', { token: invitation.setupToken, password })
      assert.equal(again.status, 403)
    })
    await t.test('expired password setup links are rejected', async () => {
      const token = await payload.forgotPassword({ collection: 'users', data: { email: other.email }, disableEmail: true })
      await payload.db.updateOne({ collection: 'users', id: other.id, data: { resetPasswordExpiration: new Date(0).toISOString() } })
      assert.equal((await request('/api/users/reset-password', undefined, 'POST', { token, password })).status, 403)
    })
    await t.test('writers cannot list account details, escalate roles or disable themselves', async () => {
      const users = await (await request('/api/users', writer.token)).json()
      assert.deepEqual(users.docs.map((u: { id: number }) => u.id), [writer.id])
      const result = await request('/api/users/' + writer.id, writer.token, 'PATCH', { role: 'admin', active: false })
      assert.equal(result.status, 200, await result.clone().text())
      const current = await payload.findByID({ collection: 'users', id: writer.id })
      assert.equal(current.role, 'marketing'); assert.equal(current.active, true)
      assert.equal((await request('/api/users/' + other.id, writer.token, 'PATCH', { name: 'Changed' })).status, 403)
      assert.equal((await request('/api/users/' + writer.id, writer.token, 'PATCH', { email: 'swapped@example.test' })).status, 403)
    })
    await t.test('writers can edit only their own drafts, including private revisions and version history', async () => {
      const created = await request('/api/posts?draft=true', writer.token, 'POST', {
        title: 'Private writer article', content, ownerId: other.id,
      })
      assert.equal(created.status, 201, await created.clone().text())
      const post = (await created.json()).doc
      assert.equal(post.ownerId, writer.id)
      assert.equal((await request('/api/posts/' + post.id + '?draft=true', other.token)).status, 404)
      const edit = await request('/api/posts/' + post.id + '?draft=true', other.token, 'PATCH', { title: 'Stolen article' })
      assert.ok([403, 404].includes(edit.status), await edit.text())
      assert.equal((await request('/api/posts/' + post.id, writer.token, 'PATCH', { _status: 'published' })).status, 403)
      assert.equal((await request('/api/posts/' + post.id, admin.token, 'PATCH', { _status: 'published' })).status, 200)
      assert.equal((await request('/api/posts/' + post.id + '?draft=true', writer.token, 'PATCH', { title: 'Hidden revision' })).status, 200)
      assert.equal((await request('/api/posts/' + post.id + '?draft=true', other.token)).status, 404)
      const versions = await request('/api/posts/versions', other.token)
      assert.equal(versions.status, 200, await versions.clone().text())
      assert.ok(!(await versions.json()).docs.some((v: { parent: number }) => v.parent === post.id))
      const ownVersions = await request('/api/posts/versions', writer.token)
      assert.equal(ownVersions.status, 200, await ownVersions.clone().text())
      assert.ok((await ownVersions.json()).docs.some((v: { parent: number }) => v.parent === post.id))
      const publicCopy = await (await request('/api/posts/' + post.id)).json()
      assert.equal(publicCopy.title, 'Private writer article')
      assert.equal(publicCopy.ownerId, undefined)
    })
    await t.test('private photos belong to their uploader and become public only when published', async () => {
      const image = await sharp({ create: { width: 8, height: 8, channels: 3, background: '#14283c' } }).png().toBuffer()
      const media = await payload.create({ collection: 'media', user: { ...writer, collection: 'users' }, overrideAccess: false,
        data: { alt: 'Private test photo' }, file: { data: image, mimetype: 'image/png', name: 'access-test.png', size: image.length } })
      assert.equal(media.ownerId, writer.id)
      assert.equal((await request('/api/media/' + media.id, writer.token)).status, 200)
      assert.equal((await request('/api/media/' + media.id, other.token)).status, 404)
      const file = new URL(media.url!, base).pathname
      assert.ok([403,404].includes((await request(file)).status))
      assert.ok([403,404].includes((await request(file, other.token)).status))
      assert.equal((await request(file, writer.token)).status, 200)
      const post = await request('/api/posts', admin.token, 'POST', { title: 'Public photo test', content, coverImage: media.id, _status: 'published' })
      assert.equal(post.status, 201, await post.clone().text())
      assert.equal((await request(file)).status, 200)
      assert.ok([403,404].includes((await request('/api/media/' + media.id, writer.token, 'PATCH', { alt: 'Changed public photo' })).status))
    })
    await t.test('administrator role changes take effect and revoke the old session', async () => {
      const response = await request('/api/users/' + invitation.id, admin.token, 'PATCH', { role: 'publisher' })
      assert.equal(response.status, 200, await response.clone().text())
      assert.equal((await payload.findByID({ collection: 'users', id: invitation.id })).role, 'publisher')
      assert.equal((await request('/api/posts?draft=true', invitation.token, 'POST', { title: 'Old session', content })).status, 403)
    })
    await t.test('disabled accounts cannot sign in, reset into a session or use old sessions', async () => {
      assert.equal((await request('/api/users/' + other.id, admin.token, 'PATCH', { active: false })).status, 200)
      assert.equal((await request('/api/users/login', undefined, 'POST', { email: other.email, password })).status, 403)
      assert.equal((await request('/api/users/reviewers', other.token)).status, 403)
      const reset = await payload.forgotPassword({ collection: 'users', data: { email: other.email }, disableEmail: true })
      assert.equal((await request('/api/users/reset-password', undefined, 'POST', { token: reset, password })).status, 403)
      assert.equal((await request('/api/users/' + other.id + '?draft=true', other.token)).status, 403)
    })
    await t.test('reviewers include active administrators but exclude disabled accounts and writers', async () => {
      const result = await (await request('/api/users/reviewers', writer.token)).json()
      assert.ok(result.reviewers.some((a: { id: number }) => a.id === admin.id))
      assert.ok(result.reviewers.some((a: { id: number }) => a.id === publisher.id))
      assert.ok(!result.reviewers.some((a: { id: number }) => a.id === writer.id || a.id === other.id))
      assert.ok(result.reviewers.every((a: object) => Object.keys(a).sort().join(',') === 'id,name'))
    })
    await t.test('SQLite atomically preserves an active administrator during concurrent demotions', async () => {
      const results = await Promise.allSettled([
        payload.db.updateOne({ collection: 'users', id: admin.id, data: { active: false } }),
        payload.db.updateOne({ collection: 'users', id: secondAdmin.id, data: { active: false } }),
      ])
      assert.equal(results.filter(r => r.status === 'fulfilled').length, 1)
      assert.equal(results.filter(r => r.status === 'rejected').length, 1)
      const survivors = await payload.find({ collection: 'users', where: { role: { equals: 'admin' }, active: { equals: true } } })
      assert.equal(survivors.totalDocs, 1)
      const survivor = survivors.docs[0]
      await assert.rejects(payload.db.deleteOne({ collection: 'users', where: { id: { equals: survivor.id } } }))
    })
  } finally { await payload.destroy() }
})
