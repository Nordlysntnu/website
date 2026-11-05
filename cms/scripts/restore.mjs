import { restoreData } from './storage.mjs'
const [source, target] = process.argv.slice(2)
if (!source || !target || !process.argv.includes('--stopped')) throw new Error('Usage: node scripts/restore.mjs /backup/path /new/data/path --stopped')
await restoreData(source, target, { stopped: true })
console.log('Restored into a new data directory. Review ownership and environment settings before restarting the CMS.')
