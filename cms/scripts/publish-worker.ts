import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import lockfile from 'proper-lockfile'
import { setTimeout as sleep } from 'node:timers/promises'
import { getPayload } from 'payload'
import { publicationConfig } from '../src/publishing/config'
import { prepareStorage, activeRelease } from '../src/publishing/releases.mjs'
import { recoverInterruptedJobs, reconcilePublication } from '../src/publishing/worker'
import { websiteQueue } from '../src/publishing/queue'

if(existsSync('.env.local'))process.loadEnvFile('.env.local')
process.env.NORDLYS_PUBLISH_WORKER='true'
const config=publicationConfig()
if(!config.enabled)throw new Error('Set NORDLYS_PUBLISH_ENABLED=true after configuring the publication target.')
await prepareStorage(config)
const storage=path.join(config.dataDir,'publishing')
await mkdir(storage,{recursive:true,mode:0o700})
const releaseLock=await lockfile.lock(storage,{realpath:true,stale:60000,update:15000,retries:0})
let payload: Awaited<ReturnType<typeof getPayload>> | undefined
let stopping=false
process.on('SIGINT',()=>{stopping=true})
process.on('SIGTERM',()=>{stopping=true})
try{
  const {default:payloadConfig}=await import('../src/payload.config')
  payload=await getPayload({config:payloadConfig})
  // Only after taking the process lock may an interrupted task be abandoned.
  await recoverInterruptedJobs(payload)
  do{
    try{
      const desired=await reconcilePublication(payload,config)
      await payload.jobs.run({queue:websiteQueue,limit:1,overrideAccess:true})
      if(process.argv.includes('--once') && (await activeRelease(config))?.manifest.hash!==desired) process.exitCode=1
    }catch(error){
      payload.logger.error({err:error,msg:'Website publisher tick failed.'})
      await payload.updateGlobal({slug:'website-publication',overrideAccess:true,data:{
        failedAt:new Date().toISOString(),error:'Website update failed. Check the publisher service.'}}).catch(()=>{})
      if(process.argv.includes('--once'))process.exitCode=1
    }
    if(process.argv.includes('--once'))break
    await sleep(5000)
  }while(!stopping)
}finally{if(payload)await payload.destroy();await releaseLock()}
