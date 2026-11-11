import { cp, mkdir, symlink, readFile, open, lstat } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'
import { spawn, execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { createHash } from 'node:crypto'
const exec=promisify(execFile)
const roots=['src','lib','components','public','package.json','package-lock.json','next.config.js','tsconfig.json','next-env.d.ts']
export async function sourceRevision(config) {
  const git=async args=>(await exec('git',args,{cwd:config.sourceDir,windowsHide:true,maxBuffer:8*1024*1024})).stdout.trim()
  const commit=await git(['rev-parse','HEAD'])
  if(!/^[a-f0-9]{40}$/.test(commit))throw new Error('Website source has no reviewed Git revision.')
  const branch=await git(['branch','--show-current'])
  const dirty=await git(['status','--porcelain','--untracked-files=normal'])
  if(config.mode==='live'&&(branch!=='main'||dirty))throw new Error('Live publication requires a clean main checkout.')
  if(config.mode==='live'){
    const reviewed=await git(['rev-parse','--verify','refs/remotes/origin/main']).catch(()=>null)
    if(reviewed!==commit)throw new Error('Live publication requires main to match the fetched origin/main revision.')
  }
  if(!dirty)return commit
  const diff=await git(['diff','HEAD','--',...roots])
  const untracked=(await exec('git',['ls-files','-z','--others','--exclude-standard','--',...roots],{cwd:config.sourceDir,windowsHide:true})).stdout
  const digest=createHash('sha256').update(diff)
  for(const name of untracked.split('\x00').filter(Boolean).sort())digest.update(name).update(await readFile(path.join(config.sourceDir,name)))
  return commit+'-preview-'+digest.digest('hex').slice(0,16)
}
export async function buildWebsite(config,workspace,snapshotFile,assetDir,logFile) {
  await mkdir(workspace,{recursive:true})
  // Only reviewed Git files (plus explicit unignored local edits in preview) enter the build.
  // Ignored files accidentally placed under public/ must not become website assets.
  const listing=await exec('git',['ls-files','-z','--cached',...(config.mode==='preview'?['--others','--exclude-standard']:[]),'--',...roots],
    {cwd:config.sourceDir,windowsHide:true,maxBuffer:16*1024*1024})
  for(const name of [...new Set(listing.stdout.split('\x00').filter(Boolean))]){
    if(/^public\/cms-media(?:\/|$)/.test(name))continue
    const source=path.resolve(config.sourceDir,name)
    const relative=path.relative(config.sourceDir,source)
    if(relative.startsWith('..')||path.isAbsolute(relative))throw new Error('Invalid website source path.')
    const metadata=await lstat(source).catch(error=>{if(error.code==='ENOENT'&&config.mode==='preview')return null;throw error})
    if(!metadata)continue
    if(!metadata.isFile()||metadata.isSymbolicLink())throw new Error('Website build source must contain regular files only.')
    const destination=path.join(workspace,name)
    await mkdir(path.dirname(destination),{recursive:true})
    await cp(source,destination,{mode:constants.COPYFILE_FICLONE})
  }
  await symlink(path.join(config.sourceDir,'node_modules'),path.join(workspace,'node_modules'),process.platform==='win32'?'junction':'dir')
  await mkdir(path.join(workspace,'public','cms-media'),{recursive:true})
  await cp(assetDir,path.join(workspace,'public','cms-media'),{recursive:true})
  const env={}
  for(const key of ['PATH','Path','SystemRoot','WINDIR','COMSPEC','TEMP','TMP','HOME','LANG','LC_ALL','NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY'])if(process.env[key])env[key]=process.env[key]
  Object.assign(env,{NODE_ENV:'production',CI:'1',NEXT_TELEMETRY_DISABLED:'1',NORDLYS_CMS_SNAPSHOT:snapshotFile,NEXT_PUBLIC_LOCAL_PREVIEW:'false'})
  const log=await open(logFile,'a',0o600)
  try {
    await new Promise((resolve,reject)=>{
      const child=spawn(process.execPath,[path.join(config.sourceDir,'node_modules/next/dist/bin/next'),'build',workspace,'--webpack'],
        {cwd:workspace,env,windowsHide:true,detached:process.platform!=='win32',stdio:['ignore',log.fd,log.fd]})
      let timedOut=false
      const timer=setTimeout(()=>{
        timedOut=true
        if(process.platform==='win32')execFile('taskkill',['/PID',String(child.pid),'/T','/F'],{windowsHide:true},()=>{})
        else try{process.kill(-child.pid,'SIGKILL')}catch(error){if(error.code!=='ESRCH')child.kill('SIGKILL')}
      },10*60*1000)
      child.once('error',error=>{clearTimeout(timer);reject(error)})
      child.once('close',code=>{clearTimeout(timer);code===0&&!timedOut?resolve():reject(new Error(timedOut?'Website build timed out.':'Website build failed; see the private build log.'))})
    })
  } finally {await log.close()}
  return path.join(workspace,'out')
}
