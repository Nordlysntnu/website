import path from 'node:path'
import { getPayload } from 'payload'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-sqlite'
import { migrations } from '../../src/migrations'

// A stopped, legacy database fixture. Never open the native upgrader alongside libSQL.
const dataDir=path.resolve(process.env.CMS_DATA_DIR || '.')
if(process.env.CMS_ENV!=='local'||path.dirname(dataDir)!==path.resolve('.local/tests')||!path.basename(dataDir).startsWith('publication-')) {
  throw new Error('This fixture may only prepare an isolated publication test database.')
}
const {default:config}=await import('../../src/payload.config')
const payload=await getPayload({config})
try {
  await payload.db.migrate({migrations:migrations.slice(0,2).map(migration=>({
    ...migration,
    up:(args:unknown)=>migration.up(args as MigrateUpArgs),
    down:(args:unknown)=>migration.down(args as MigrateDownArgs),
  }))})
} finally {await payload.destroy()}
