import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DatabaseSync } from 'node:sqlite'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { backupData, restoreData } from '../scripts/storage.mjs'
test('SQLite and uploads survive a verified offline backup and restore', async () => {
  const root = path.resolve('.local/tests/storage-' + randomUUID())
  const data = path.join(root, 'data'), saved = path.join(root, 'backup'), restored = path.join(root, 'restored')
  await mkdir(path.join(data, 'uploads'), { recursive: true })
  const db = new DatabaseSync(path.join(data, 'cms.db'))
  db.exec("CREATE TABLE posts(id INTEGER PRIMARY KEY, title TEXT); INSERT INTO posts(title) VALUES ('Keep this article')")
  db.close()
  await writeFile(path.join(data, 'uploads/photo.png'), 'test upload content')
  await assert.rejects(backupData(data, saved), /Stop the CMS/)
  await assert.rejects(backupData(data, path.join(data, 'backup'), { stopped: true }), /outside/)
  const manifest = await backupData(data, saved, { stopped: true })
  assert.equal(Object.keys(manifest.files).length, 2)
  await restoreData(saved, restored, { stopped: true })
  const copy = new DatabaseSync(path.join(restored, 'cms.db'), { readOnly: true })
  try { assert.equal(copy.prepare('SELECT title FROM posts').get().title, 'Keep this article') } finally { copy.close() }
  assert.equal(await readFile(path.join(restored, 'uploads/photo.png'), 'utf8'), 'test upload content')
  await assert.rejects(restoreData(saved, restored, { stopped: true }), /EEXIST/)
  await writeFile(path.join(saved, 'uploads/photo.png'), 'tampered')
  await assert.rejects(restoreData(saved, path.join(root, 'tampered'), { stopped: true }), /checksum/)
  await writeFile(path.join(saved, 'manifest.json'), JSON.stringify({ format: 1, app: 'nordlys-cms', files: { 'cms.sqlite': 'fake', '../escape': 'fake' } }))
  await assert.rejects(restoreData(saved, path.join(root, 'unsafe'), { stopped: true }))
})
