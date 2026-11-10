import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile, cp } from 'node:fs/promises'
import type { Payload } from 'payload'
import { publicationConfig } from './config'
import { hash, publishedContent, writePublicSnapshot } from './content'
import { buildWebsite, sourceRevision } from './build.mjs'
import { activateRelease, activeRelease, releasePath, verifyWebsite, removeOwnedWork, pruneReleases, prepareStorage, makePublicReadable } from './releases.mjs'
export async function desiredPublication(payload: Payload,config=publicationConfig()) {
  const content=await publishedContent(payload)
  const revision=await sourceRevision(config)
  return {content,revision,hash:hash(content.contentHash+'\n'+revision)}
}
export async function publishWebsite(payload: Payload,options:{build?:typeof buildWebsite}={}) {
  const config=publicationConfig()
  if(!config.enabled)throw new Error('Website publishing is not enabled.')
  await prepareStorage(config)
  const desired=await desiredPublication(payload,config)
  const existing=await activeRelease(config)
  if(existing?.manifest.hash===desired.hash){
    await payload.updateGlobal({slug:'website-publication',overrideAccess:true,data:{
      appliedHash:desired.hash,releaseId:existing.manifest.releaseId,succeededAt:existing.manifest.createdAt,mode:config.mode,error:null,failedAt:null}})
    return {hash:desired.hash,release:existing.manifest.releaseId}
  }
  const id='pub-'+Date.now()+'-'+randomUUID()
  const work=path.join(config.workDir,id)
  const release=releasePath(config,id)
  await mkdir(work,{recursive:true})
  await mkdir(config.releaseDir,{recursive:true})
  const logDir=path.join(config.dataDir,'publishing/logs')
  await mkdir(logDir,{recursive:true})
  try{
    const exported=await writePublicSnapshot(desired.content,config.uploadDir,path.join(work,'content'))
    const out=await(options.build||buildWebsite)(config,path.join(work,'site'),exported.file,path.join(work,'content/cms-media'),path.join(logDir,id+'.log'))
    if(await sourceRevision(config)!==desired.revision)throw new Error('Website source changed during the build; refusing mixed code.')
    if((await publishedContent(payload)).contentHash!==desired.content.contentHash)throw new Error('Approved CMS content changed during the build; a new export is required.')
    const count=await verifyWebsite(out,exported.snapshot,exported.assets)
    await mkdir(release)
    await cp(out,release,{recursive:true})
    const manifest={schema:1,app:'nordlys-website',releaseId:id,hash:desired.hash,contentHash:desired.content.contentHash,
      sourceRevision:desired.revision,createdAt:new Date().toISOString(),postCount:count,assets:exported.assets}
    await writeFile(path.join(release,'publication.json'),JSON.stringify(manifest),{mode:0o644})
    await makePublicReadable(release)
    await activateRelease(config,id)
    await payload.updateGlobal({slug:'website-publication',overrideAccess:true,data:{
      appliedHash:desired.hash,releaseId:id,succeededAt:manifest.createdAt,mode:config.mode,failedAt:null,failedHash:null,error:null}}).catch(error=>payload.logger.error({err:error,msg:'Website is active; its CMS status will be reconciled.'}))
    await pruneReleases(config).catch(error=>payload.logger.error({err:error,msg:'Publication succeeded but release cleanup needs attention.'}))
    return {hash:desired.hash,release:id}
  }catch(error){
    await payload.updateGlobal({slug:'website-publication',overrideAccess:true,data:{
      failedAt:new Date().toISOString(),failedHash:desired.hash,error:'Website update failed. The previous version is still available.'}}).catch(()=>{})
    throw error
  }finally{
    await removeOwnedWork(config.workDir,work)
  }
}
