import { backupData } from './storage.mjs'
const target = process.argv[2]
if (!process.env.CMS_DATA_DIR || !target || !process.argv.includes('--stopped')) throw new Error('Usage: CMS_DATA_DIR=/absolute/data node scripts/backup.mjs /new/backup/path --stopped')
await backupData(process.env.CMS_DATA_DIR, target, { stopped: true })
console.log('Database and uploads backed up with checksums. Copy the protected backup outside the VM.')
