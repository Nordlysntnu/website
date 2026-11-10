import { APIError, type Endpoint } from 'payload'
import { isEditor, isPublisher } from '../access'
import { publicationConfig } from './config'
import { requestPublication, websiteQueue } from './queue'
export const publicationEndpoints: Endpoint[] = [
  { path:'/website-publication', method:'get', handler:async req => {
    if (!isEditor(req)) throw new APIError('Sign in to see publication status.',403)
    const config = publicationConfig()
    if (!config.enabled) return Response.json({status:'disabled',websiteURL:config.websiteURL},{headers:{'Cache-Control':'no-store'}})
    const [state,processing,pending] = await Promise.all([
      req.payload.findGlobal({slug:'website-publication',overrideAccess:true,req}),
      req.payload.count({collection:'payload-jobs',overrideAccess:true,req,where:{queue:{equals:websiteQueue},processing:{equals:true}}}),
      req.payload.count({collection:'payload-jobs',overrideAccess:true,req,where:{queue:{equals:websiteQueue},completedAt:{exists:false},hasError:{not_equals:true},processing:{not_equals:true}}}),
    ])
    const status = processing.totalDocs ? 'building'
      : state.error==='Website restored to an earlier version. Automatic publishing is paused.' ? 'restored'
      : pending.totalDocs ? 'queued'
      : state.failedAt && (!state.succeededAt || state.failedAt > state.succeededAt) ? 'failed'
      : state.appliedHash ? (state.mode==='preview' ? 'preview' : 'published') : 'idle'
    return Response.json({ status, updatedAt:state.succeededAt || null, websiteURL:config.websiteURL,
      message:status==='failed' ? 'Website build failed. The previous version is still available.' : null },
      {headers:{'Cache-Control':'no-store'}})
  }},
  { path:'/website-publication/retry',method:'post',handler:async req => {
    if (!isPublisher(req.user)) throw new APIError('Only publishers can request a website update.',403)
    if (!publicationConfig().enabled) throw new APIError('Website publishing is not enabled yet.',409)
    await requestPublication(req.payload,req)
    return Response.json({message:'Website update queued.'},{status:202})
  }},
]
