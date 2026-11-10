import { DatabaseSync, backup } from 'node:sqlite'
import { mkdir, readdir, lstat, readFile, writeFile, copyFile } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import { createHash } from 'node:crypto'
import path from 'node:path'

const inside = (base, target) => { const rel = path.relative(base, target); return !rel || (!rel.startsWith('..' + path.sep) && !path.isAbsolute(rel) && rel !== '..') }
const checksum = async file => { const hash = createHash('sha256'); for await (const chunk of createReadStream(file)) hash.update(chunk); return hash.digest('hex') }
async function filesBelow(dir, prefix = '') {
  const result = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const name = prefix ? prefix + '/' + entry.name : entry.name
    const file = path.join(dir, entry.name)
    if ((await lstat(file)).isSymbolicLink()) throw new Error('Backups do not follow symlinks.')
    if (entry.isDirectory()) result.push(...await filesBelow(file, name))
    else if (entry.isFile()) result.push(name)
    else throw new Error('Unsupported backup file: ' + name)
  }
  return result
}
function checkedPath(base, relative) {
  if (typeof relative !== 'string' || relative.includes('\\') || relative.startsWith('/') || relative.split('/').some(p => p === '..' || p === '' || p.includes(':'))) throw new Error('Unsafe path in backup manifest.')
  const result = path.resolve(base, relative)
  if (!inside(base, result)) throw new Error('Unsafe path in backup manifest.')
  return result
}
async function rejectLinks(base, name) {
 let current = base
 for (const part of name.split('/')) { current = path.join(current, part); if ((await lstat(current)).isSymbolicLink()) throw new Error('Backups do not follow symlinks.') }
}
export async function backupData(source, target, { stopped = false } = {}) {
  source = path.resolve(source); target = path.resolve(target)
  if (!stopped) throw new Error('Stop the CMS first, then explicitly confirm maintenance mode.')
  if (inside(source, target) || inside(target, source)) throw new Error('Backup must be outside the data directory.')
  await mkdir(target, { mode: 0o700 }) // Never overwrite an existing backup.
  const db = new DatabaseSync(path.join(source, 'cms.db'), { readOnly: true })
  try {
    if (db.prepare('PRAGMA integrity_check').get().integrity_check !== 'ok') throw new Error('Database integrity check failed.')
    await backup(db, path.join(target, 'cms.sqlite'))
  } finally { db.close() }
  let uploads = []
  try { uploads = await filesBelow(path.join(source, 'uploads')) } catch (error) { if (error.code !== 'ENOENT') throw error }
  for (const name of uploads) {
    const destination = checkedPath(target, 'uploads/' + name)
    await mkdir(path.dirname(destination), { recursive: true, mode: 0o700 })
    await copyFile(checkedPath(path.join(source, 'uploads'), name), destination)
  }
  const files = {}
  for (const name of ['cms.sqlite', ...uploads.map(name => 'uploads/' + name)]) files[name] = await checksum(checkedPath(target, name))
  const manifest = { format: 1, app: 'nordlys-cms', createdAt: new Date().toISOString(), files }
  await writeFile(path.join(target, 'manifest.json'), JSON.stringify(manifest, null, 2), { mode: 0o600 })
  return manifest
}
export async function restoreData(source, target, { stopped = false } = {}) {
  source = path.resolve(source); target = path.resolve(target)
  if (!stopped) throw new Error('Stop the CMS before restoring.')
  if (inside(source, target) || inside(target, source)) throw new Error('Restore into a separate new data directory.')
  const manifest = JSON.parse(await readFile(path.join(source, 'manifest.json'), 'utf8'))
  if (manifest.format !== 1 || manifest.app !== 'nordlys-cms' || typeof manifest.files !== 'object' || !manifest.files['cms.sqlite']) throw new Error('Unsupported backup.')
  for (const [name, expected] of Object.entries(manifest.files)) {
    const file = checkedPath(source, name)
    if (name !== 'cms.sqlite' && !name.startsWith('uploads/')) throw new Error('Unexpected backup content.')
    await rejectLinks(source, name)
    if (await checksum(file) !== expected) throw new Error('Backup checksum failed: ' + name)
  }
  const db = new DatabaseSync(path.join(source, 'cms.sqlite'), { readOnly: true })
  try { if (db.prepare('PRAGMA integrity_check').get().integrity_check !== 'ok') throw new Error('Backup database integrity failed.') }
  finally { db.close() }
  await mkdir(target, { mode: 0o700 }) // Restoration refuses to overwrite existing live data.
  for (const name of Object.keys(manifest.files)) {
    const destination = name === 'cms.sqlite' ? path.join(target, 'cms.db') : checkedPath(target, name)
    await mkdir(path.dirname(destination), { recursive: true, mode: 0o700 })
    await copyFile(checkedPath(source, name), destination)
  }
  return manifest
}
