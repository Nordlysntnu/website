import type { Payload } from 'payload'
import { publicationConfig } from './config'
import { desiredPublication } from './run'
import { activeRelease } from './releases.mjs'
import { requestPublication, websiteQueue } from './queue'

export async function recoverInterruptedJobs(payload: Payload) {
  await payload.update({collection:'payload-jobs',overrideAccess:true,
    where:{queue:{equals:websiteQueue},processing:{equals:true}},
    data:{processing:false,hasError:true,error:{message:'Worker restarted before completion.'}}})
}
export async function reconcilePublication(payload: Payload,config=publicationConfig()) {
  const desired=await desiredPublication(payload,config)
  const current=await activeRelease(config)
  const state=await payload.findGlobal({slug:'website-publication',overrideAccess:true})
  if(current?.manifest.hash===desired.hash){
    if(state.appliedHash!==desired.hash||state.failedAt)await payload.updateGlobal({slug:'website-publication',overrideAccess:true,
      data:{appliedHash:desired.hash,releaseId:current.manifest.releaseId,succeededAt:current.manifest.createdAt,mode:config.mode,failedAt:null,failedHash:null,error:null}})
  }else{
    const pending=await payload.count({collection:'payload-jobs',overrideAccess:true,where:{
      queue:{equals:websiteQueue},completedAt:{exists:false},hasError:{not_equals:true}}})
    const cooling=state.failedHash===desired.hash&&state.failedAt&&Date.now()-Date.parse(state.failedAt)<300000
    if(!pending.totalDocs&&!cooling)await requestPublication(payload)
  }
  return desired.hash
}
