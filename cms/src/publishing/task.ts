import type { TaskConfig } from 'payload'
export const publishWebsiteTask: TaskConfig<{input:Record<string,never>;output:{hash:string;release:string}}> = {
  slug:'publishWebsite',
  inputSchema:[],
  outputSchema:[{name:'hash',type:'text',required:true},{name:'release',type:'text',required:true}],
  concurrency:{key:()=> 'website',exclusive:true,supersedes:true},
  retries:{attempts:3,backoff:{type:'exponential',delay:15000}},
  handler:async({req})=>{
    if(process.env.NORDLYS_PUBLISH_WORKER!=='true')throw new Error('Website jobs run only in the dedicated worker.')
    const {publishWebsite}=await import('./run')
    try { return {output:await publishWebsite(req.payload)} } catch(error) {
      await req.payload.updateGlobal({slug:'website-publication',overrideAccess:true,data:{failedAt:new Date().toISOString(),error:'Website update failed. The previous version is still available.'}}).catch(()=>{})
      throw error
    }
  },
}
