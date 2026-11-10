import { mkdir, readFile, writeFile, rename, symlink, lstat, realpath, unlink, readdir, rm, access, chmod } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID, createHash } from 'node:crypto'
const releasePattern = /^pub-\d{13}-[a-f0-9-]{36}$/
export const within = (root,file) => { const r=path.relative(path.resolve(root),path.resolve(file)); return r!=='' && !r.startsWith('..'+path.sep) && r!=='..' && !path.isAbsolute(r) }
export function releasePath(config,id) {
  if (!releasePattern.test(id)) throw new Error('Invalid website release ID.')
  const file=path.join(config.releaseDir,id)
  if(!within(config.releaseDir,file))throw new Error('Release outside its storage directory.')
  return file
}
export async function activeRelease(config) {
  const pointer=await lstat(config.activePath).catch(error=>{if(error.code==='ENOENT')return null;throw error})
  if(!pointer)return null
  if(config.mode==='preview'&&(!pointer.isFile()||pointer.isSymbolicLink()))throw new Error('Invalid preview pointer.')
  {
    let id
    if(config.mode==='preview') id=JSON.parse(await readFile(config.activePath,'utf8')).releaseId
    else {
      if(!(await lstat(config.activePath)).isSymbolicLink())throw new Error('The live website path must be an owned symlink; existing directories are never replaced automatically.')
      const target=await realpath(config.activePath)
      if(!within(config.releaseDir,target))throw new Error('Active website points outside the release directory.')
      id=path.basename(target)
    }
    const dir=releasePath(config,id)
    const manifest=JSON.parse(await readFile(path.join(dir,'publication.json'),'utf8'))
    if(manifest.app!=='nordlys-website'||manifest.releaseId!==id||!/^([a-f0-9]{64})$/.test(manifest.hash))throw new Error('Invalid active website manifest.')
    return {dir,manifest}
  }
}
export async function activateRelease(config,id) {
  const next=releasePath(config,id)
  await access(path.join(next,'index.html'))
  await access(path.join(next,'publication.json'))
  await activeRelease(config) // Validate the existing pointer before replacing anything.
  await mkdir(path.dirname(config.activePath),{recursive:true})
  const temp=config.activePath+'.next-'+randomUUID()
  try {
    if(config.mode==='preview') await writeFile(temp,JSON.stringify({releaseId:id}),{mode:0o600,flag:'wx'})
    else {
      if(process.platform==='win32')throw new Error('Live atomic symlink activation requires the Linux VM.')
      await symlink(next,temp,'dir')
    }
    await rename(temp,config.activePath)
  } finally {try{await unlink(temp)}catch(e){if(e.code!=='ENOENT')throw e}}
}
function noPrivateKeys(value) {
  if(!value||typeof value!=='object')return
  const forbidden=new Set(['reviewNote','ownerId','ownerName','reviewerId','reviewerName','activity','submittedBy','lastEditedBy','password','hash','salt'])
  for(const [key,child] of Object.entries(value)){if(forbidden.has(key))throw new Error('Private editorial fields in website output.');noPrivateKeys(child)}
}
export function pageProps(html) {
  const match=html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if(!match)throw new Error('Website page has no Next.js data.')
  const props=JSON.parse(match[1]).props?.pageProps
  if(!props)throw new Error('Invalid exported website page.')
  noPrivateKeys(props)
  return props
}
export async function verifyWebsite(out,snapshot,assets) {
  const home=pageProps(await readFile(path.join(out,'index.html'),'utf8'))
  if(!Array.isArray(home.cmsPosts))throw new Error('The home page did not consume the CMS snapshot.')
  const props=pageProps(await readFile(path.join(out,'blog.html'),'utf8'))
  if(!Array.isArray(props.cmsPosts))throw new Error('The build did not consume the CMS snapshot.')
  if(JSON.stringify(home.cmsPosts.map(p=>p.id))!==JSON.stringify(props.cmsPosts.map(p=>p.id)))throw new Error('Home and blog exports contain different article lists.')
  for(const post of snapshot.posts)if(!props.cmsPosts.some(p=>p.id===post.id))throw new Error('Published article missing from the website build.')
  for(const post of props.cmsPosts){
    const slug=post.slug||String(post.id)
    if(!/^(\d+|legacy-[a-f0-9]{20})$/.test(slug))throw new Error('Invalid article route.')
    const article=pageProps(await readFile(path.join(out,'blog',slug+'.html'),'utf8'))
    if(article.post?.id!==post.id)throw new Error('Exported article does not match the index.')
    if(typeof post.id==='number'){
      const alias=pageProps(await readFile(path.join(out,'blog',post.id+'.html'),'utf8'))
      if(alias.post?.id!==post.id)throw new Error('Article alias points to the wrong article.')
    }
  }
  for(const asset of assets){
    if(!/^cms-media\/[a-f0-9]{64}\.(jpg|png|webp)$/.test(asset.path))throw new Error('Invalid public asset path.')
    const bytes=await readFile(path.join(out,asset.path))
    if(createHash('sha256').update(bytes).digest('hex')!==asset.sha256)throw new Error('Published image checksum failed.')
  }
  return props.cmsPosts.length
}
export async function removeOwnedWork(root,dir) {
  if(!within(root,dir))throw new Error('Refusing to remove a directory outside publication work storage.')
  const meta=await lstat(dir).catch(e=>{if(e.code!=='ENOENT')throw e;return null})
  if(meta?.isSymbolicLink())throw new Error('Refusing to follow a publication work symlink.')
  if(meta)await rm(dir,{recursive:true,force:false})
}
export async function pruneReleases(config,keep=3) {
  const current=await activeRelease(config)
  if(!current)return
  const entries=[]
  for(const name of await readdir(config.releaseDir)){
    if(!releasePattern.test(name)||name===current.manifest.releaseId)continue
    const dir=releasePath(config,name)
    if((await lstat(dir)).isSymbolicLink())continue
    const info=JSON.parse(await readFile(path.join(dir,'publication.json'),'utf8').catch(()=> '{}'))
    if(info.app==='nordlys-website'&&info.releaseId===name)entries.push({dir,name})
  }
  entries.sort((a,b)=>b.name.localeCompare(a.name))
  for(const item of entries.slice(Math.max(0,keep-1)))await removeOwnedWork(config.releaseDir,item.dir)
}

// These paths are operator configuration, never editable job input.
export async function prepareStorage(config) {
  for(const directory of [config.workDir,config.releaseDir,path.dirname(config.activePath)]){
    let ancestor=path.resolve(directory)
    while(true){
      const metadata=await lstat(ancestor).catch(error=>{if(error.code==='ENOENT')return null;throw error})
      if(metadata?.isSymbolicLink())throw new Error('Publication storage cannot contain symlink ancestors.')
      if(metadata&&!metadata.isDirectory())throw new Error('Publication storage requires directories.')
      const parent=path.dirname(ancestor)
      if(parent===ancestor)break
      ancestor=parent
    }
    await mkdir(directory,{recursive:true})
  }
  if(config.mode==='live')await chmod(config.releaseDir,0o755)
}
export async function makePublicReadable(directory) {
  if((await lstat(directory)).isSymbolicLink())throw new Error('A website release cannot contain symlinks.')
  await chmod(directory,0o755)
  for(const item of await readdir(directory,{withFileTypes:true})){
    const file=path.join(directory,item.name)
    if(item.isSymbolicLink())throw new Error('A website release cannot contain symlinks.')
    if(item.isDirectory())await makePublicReadable(file)
    else if(item.isFile())await chmod(file,0o644)
    else throw new Error('Unsupported website release entry.')
  }
}
