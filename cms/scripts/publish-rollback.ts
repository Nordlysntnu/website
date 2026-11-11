import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import lockfile from 'proper-lockfile'
import { getPayload } from 'payload'
import { publicationConfig } from '../src/publishing/config'
import { activeRelease, activateRelease, pageProps, prepareStorage, releasePath, verifyWebsite } from '../src/publishing/releases.mjs'

if(existsSync('.env.local'))process.loadEnvFile('.env.local')
const config=publicationConfig()
if(!config.enabled)throw new Error('Review the configured publication target before activating a release.')
const id=process.argv[2]
if(!id)throw new Error('Usage: npm run publish:rollback -- RELEASE_ID (stop the worker first).')
await prepareStorage(config)
const unlock=await lockfile.lock(path.join(config.dataDir,'publishing'),{realpath:true,stale:60000,update:15000,retries:0})
let payload: Awaited<ReturnType<typeof getPayload>> | undefined
try{
  const before=await activeRelease(config)
  if(!before)throw new Error('No active release to roll back.')
  const target=releasePath(config,id)
  const manifest=JSON.parse(await readFile(path.join(target,'publication.json'),'utf8'))
  if(manifest.app!=='nordlys-website'||manifest.releaseId!==id||!/^[a-f0-9]{64}$/.test(manifest.hash))throw new Error('Invalid rollback manifest.')
  const cards=pageProps(await readFile(path.join(target,'blog.html'),'utf8')).cmsPosts
  await verifyWebsite(target,{posts:cards},manifest.assets)
  await activateRelease(config,id)
  const {default:payloadConfig}=await import('../src/payload.config')
  payload=await getPayload({config:payloadConfig})
  await payload.updateGlobal({slug:'website-publication',overrideAccess:true,data:{
    appliedHash:manifest.hash,releaseId:id,failedAt:new Date().toISOString(),failedHash:null,
    error:'Website restored to an earlier version. Automatic publishing is paused.'}})
  console.log('Activated retained release '+id+'. Keep the publisher stopped while investigating; restarting it rebuilds current approved content.')
}finally{if(payload)await payload.destroy();await unlock()}
