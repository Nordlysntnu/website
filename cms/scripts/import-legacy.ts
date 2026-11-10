import { existsSync } from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'
import { importLegacy } from '../src/publishing/import-legacy'
import { sourceRevision } from '../src/publishing/build.mjs'
if(existsSync('.env.local'))process.loadEnvFile('.env.local')
const sourceDir=path.resolve(process.env.NORDLYS_PUBLISH_SOURCE || '..')
if(process.env.CMS_ENV==='production')await sourceRevision({sourceDir,mode:'live'})
const {default:config}=await import('../src/payload.config')
const {blogs}=await import('../../src/shared/data/blog')
const payload=await getPayload({config})
try{console.log(await importLegacy(payload,blogs,sourceDir))}finally{await payload.destroy()}
