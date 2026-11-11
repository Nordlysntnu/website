import assert from 'node:assert/strict'
import { test } from 'node:test'
import path from 'node:path'
import { cmsRuntime } from '../src/lib/runtime'
import { proxy } from '../src/proxy'
import { NextRequest } from 'next/server.js'

test('local mode cannot expose a public CMS origin', () => {
  assert.throws(() => cmsRuntime({ PAYLOAD_SECRET: 'local', CMS_URL: 'https://cms.nordlysntnu.no' }), /CMS_ENV=production/)
  assert.equal(cmsRuntime({ PAYLOAD_SECRET: 'local' }).serverURL, 'http://127.0.0.1:3010')
})
test('production requires HTTPS, durable local storage, SMTP and a strong secret', () => {
  const env = { CMS_ENV: 'production', CMS_URL: 'https://cms.nordlysntnu.no', PAYLOAD_SECRET: 'a'.repeat(48),
    CMS_DATA_DIR: path.resolve('../production-data'), SMTP_HOST: 'relay.example.test' }
  assert.equal(cmsRuntime(env).production, true)
  assert.throws(() => cmsRuntime({ ...env, CMS_URL: 'http://cms.nordlysntnu.no' }), /HTTPS/)
  assert.throws(() => cmsRuntime({ ...env, PAYLOAD_SECRET: 'weak' }), /32/)
  assert.throws(() => cmsRuntime({ ...env, CMS_DATA_DIR: 'relative' }), /absolute/)
  assert.throws(() => cmsRuntime({ ...env, CMS_DATA_DIR: process.cwd() }), /outside/)
  assert.throws(() => cmsRuntime({ ...env, SMTP_HOST: '' }), /SMTP/)
  assert.equal(cmsRuntime({ ...env, SMTP_HOST: '', CMS_EMAIL_MODE: 'manual' }).emailMode, 'manual')
  assert.equal(cmsRuntime(env).emailMode, 'smtp')
  assert.throws(() => cmsRuntime({ ...env, CMS_EMAIL_MODE: 'log' }), /CMS_EMAIL_MODE/)
  assert.throws(() => cmsRuntime({ ...env, CMS_SCHEMA_PUSH: 'true' }), /migrations/)
  assert.throws(() => cmsRuntime({ ...env, DATABASE_URL: 'file:/wrong/cms.db' }), /CMS_DATA_DIR/)
  assert.throws(() => cmsRuntime({ ...env, CMS_URL: 'https://user:password@cms.nordlysntnu.no' }), /origin/)
})
test('first render defaults to dark even on a light OS and keeps unrelated cookies', () => {
  const request = new NextRequest('https://cms.nordlysntnu.no/admin/login', {
    headers: { cookie: 'payload-token=unchanged; payload-theme=invalid', 'Sec-CH-Prefers-Color-Scheme': 'light' },
  })
  const response = proxy(request)
  assert.equal(response.cookies.get('payload-theme')?.value, 'dark')
  assert.equal(response.cookies.get('payload-theme')?.secure, true)
  const forwarded = response.headers.get('x-middleware-request-cookie')!
  assert.ok(forwarded.includes('payload-token=unchanged'))
  assert.ok(forwarded.includes('payload-theme=dark'))
  assert.ok(!forwarded.includes('invalid'))
})
test('an explicit light or dark preference is preserved without resetting it', () => {
  for (const theme of ['light', 'dark']) {
    const response = proxy(new NextRequest('http://127.0.0.1:3010/admin', { headers: { cookie: 'payload-theme=' + theme } }))
    assert.equal(response.cookies.get('payload-theme'), undefined)
    assert.equal(response.headers.get('x-middleware-request-cookie'), null)
  }
})
test('photos inside a photo row count as article photos for access and publishing', async () => {
  const { postPhotoIDs, coverPhoto } = await import('../src/lib/blog')
  const post = { coverImage: null, gallery: [], content: { root: { children: [
    { type: 'paragraph', children: [{ type: 'text', text: 'Intro' }] },
    { type: 'block', fields: { blockType: 'photoRow', photos: [{ image: 7 }, { image: { id: 8, url: '/api/media/file/8.webp', alt: 'Eight' } }] } },
    { type: 'upload', relationTo: 'media', value: 9, fields: { layout: 'wide' } },
    { type: 'block', fields: { blockType: 'somethingElse', photos: [{ image: 99 }] } },
  ] } } } as never
  assert.deepEqual(postPhotoIDs(post).sort(), [7, 8, 9])
  assert.equal(coverPhoto(post)?.id, 8)
})
