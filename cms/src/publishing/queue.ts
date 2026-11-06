import type { Payload, PayloadRequest, CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { publicationConfig } from './config'
export const websiteQueue = 'website'
export async function requestPublication(payload: Payload, req?: PayloadRequest) {
  if (!publicationConfig().enabled || req?.context.skipWebsitePublication) return null
  return payload.jobs.queue({ task:'publishWebsite', queue:websiteQueue, input:{}, req, overrideAccess:true })
}
export const afterPostChange: CollectionAfterChangeHook = async ({doc,previousDoc,req}) => {
  if (!req.context.websiteDraftSave && (doc._status==='published' || previousDoc?._status==='published')) {
    try { await requestPublication(req.payload,req) }
    catch (error) { req.payload.logger.error({err:error,msg:'Website publication will be recovered by worker reconciliation.'}) }
  }
  return doc
}
export const afterPostDelete: CollectionAfterDeleteHook = async ({doc,req}) => {
  if (doc._status==='published') {
    try { await requestPublication(req.payload,req) }
    catch (error) { req.payload.logger.error({err:error,msg:'Website withdrawal will be recovered by worker reconciliation.'}) }
  }
  return doc
}
