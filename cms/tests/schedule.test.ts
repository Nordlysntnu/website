import assert from 'node:assert/strict'
import { test } from 'node:test'
import { randomBytes, randomUUID } from 'node:crypto'
import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { getPayload, type Payload } from 'payload'
import type { Post, User } from '../src/payload-types'

const content = { root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: [
  { type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'The car drove on its own power for the first time.', detail: 0, format: 0, mode: 'normal', style: '' }] },
] } } as unknown as Post['content']

test('scheduled publishing: publishers set a time, the publisher service publishes it, writer edits cancel it', async (t) => {
  const dataDir = path.resolve('.local/tests/schedule-' + randomUUID())
  await mkdir(dataDir, { recursive: true, mode: 0o700 })
  // 2FA is required, as in production: the scheduled publish must not depend on a 2FA session.
  Object.assign(process.env, {
    CMS_ENV: 'local', CMS_URL: 'http://127.0.0.1:3010', NODE_ENV: 'test', CMS_REQUIRE_2FA: 'true',
    PAYLOAD_SECRET: randomBytes(48).toString('hex'), CMS_DATA_DIR: dataDir,
    DATABASE_URL: 'file:' + path.join(dataDir, 'cms.db').replaceAll('\\', '/'), CMS_SCHEMA_PUSH: 'false',
  })
  const { default: config } = await import('../src/payload.config')
  const { publishDuePosts, scheduledPosts } = await import('../src/lib/schedule')
  const { notificationsFor } = await import('../src/lib/notifications')
  const payload: Payload = await getPayload({ config })
  payload.logger.level = 'fatal'
  try {
    await payload.db.migrate()
    // A signed-in member with a finished 2FA check, as the admin panel sees them.
    const member = async (role: 'publisher' | 'marketing', name: string) => {
      const user = await payload.create({ collection: 'users', context: { accountProvisioning: true }, overrideAccess: true,
        data: { name, email: randomUUID() + '@example.test', password: 'Disposable schedule test ' + randomUUID(), role, active: true } as User })
      const sid = randomUUID()
      await payload.update({ collection: 'users', id: user.id, overrideAccess: true,
        data: { totpEnabledAt: new Date().toISOString(), mfaSessionIds: [sid] } as Partial<User> })
      return { ...(await payload.findByID({ collection: 'users', id: user.id, overrideAccess: true })), _sid: sid, collection: 'users' } as User & { _sid: string }
    }
    const publisher = await member('publisher', 'Pia Publisher')
    const writer = await member('marketing', 'Wilma Writer')
    const asUser = (user: User) => ({ user, overrideAccess: false, draft: true, depth: 0 } as const)
    const draft = async (id: number) => (await payload.findByID({ collection: 'posts', id, draft: true, overrideAccess: true, depth: 0 })) as Post
    const inAnHour = () => new Date(Date.now() + 60 * 60_000).toISOString()

    const created = await payload.create({ collection: 'posts', ...asUser(writer), data: { title: 'First drive', content, publishAt: inAnHour() } as Post })
    const id = created.id
    assert.equal((await draft(id)).publishAt ?? null, null, 'a writer cannot schedule')

    await t.test('a publisher schedules a draft; the time must be in the future', async () => {
      await assert.rejects(payload.update({ collection: 'posts', id, ...asUser(publisher), data: { publishAt: new Date(Date.now() - 1000).toISOString() } }), /minute from now/)
      const when = inAnHour()
      await payload.update({ collection: 'posts', id, ...asUser(publisher), data: { publishAt: when } })
      const post = await draft(id)
      assert.equal(new Date(post.publishAt!).toISOString(), when)
      assert.equal(post.scheduledBy, publisher.id)
      assert.equal(post.scheduledByName, 'Pia Publisher')
      assert.equal((await scheduledPosts(payload, publisher)).totalDocs, 1)
      assert.equal((await scheduledPosts(payload, writer)).totalDocs, 1, 'the owner sees it too')
    })

    await t.test('nothing is published before its time', async () => {
      assert.deepEqual(await publishDuePosts(payload, new Date()), { published: [], cancelled: [] })
      assert.equal((await payload.find({ collection: 'posts', draft: false, overrideAccess: true, where: { _status: { equals: 'published' } } })).totalDocs, 0)
    })

    await t.test('at its time the service publishes it as the scheduling publisher', async () => {
      const due = new Date(new Date((await draft(id)).publishAt!).getTime() + 1000)
      assert.deepEqual(await publishDuePosts(payload, due), { published: [id], cancelled: [] })
      const live = await payload.findByID({ collection: 'posts', id, draft: false, overrideAccess: true, depth: 0 }) as Post
      assert.equal(live._status, 'published')
      assert.equal(live.publishAt ?? null, null, 'the schedule is used up')
      assert.equal(live.lastEditedBy, 'Pia Publisher')
      assert.ok((await notificationsFor(payload, writer)).some((item) => item.message === 'Your article was published'))
      assert.deepEqual(await publishDuePosts(payload, due), { published: [], cancelled: [] }, 'published once')
    })

    await t.test("a writer's change cancels the schedule and tells the publisher", async () => {
      const second = await payload.create({ collection: 'posts', ...asUser(writer), data: { title: 'Second drive', content } as Post })
      await payload.update({ collection: 'posts', id: second.id, ...asUser(publisher), data: { publishAt: inAnHour() } })
      await payload.update({ collection: 'posts', id: second.id, ...asUser(writer), data: { title: 'Second drive (edited)' } })
      const post = await draft(second.id)
      assert.equal(post.publishAt ?? null, null)
      assert.equal(post.scheduledBy ?? null, null)
      assert.ok((await notificationsFor(payload, publisher)).some((item) => item.postID === second.id && /cancelled/.test(item.message)))
      assert.deepEqual(await publishDuePosts(payload, new Date(Date.now() + 2 * 60 * 60_000)), { published: [], cancelled: [] })
    })

    await t.test('a schedule whose publisher lost the role is cancelled, not published', async () => {
      const third = await payload.create({ collection: 'posts', ...asUser(writer), data: { title: 'Third drive', content } as Post })
      await payload.update({ collection: 'posts', id: third.id, ...asUser(publisher), data: { publishAt: inAnHour() } })
      await payload.update({ collection: 'users', id: publisher.id, overrideAccess: true, data: { role: 'marketing' } })
      const result = await publishDuePosts(payload, new Date(Date.now() + 2 * 60 * 60_000))
      assert.deepEqual(result, { published: [], cancelled: [third.id] })
      assert.equal((await draft(third.id))._status, 'draft')
      assert.ok((await notificationsFor(payload, writer)).some((item) => item.postID === third.id && /cancelled/.test(item.message)))
    })
  } finally {
    await payload.destroy?.()
    await rm(dataDir, { recursive: true, force: true }).catch(() => {})
  }
})
