import type { Post } from '../src/payload-types'
import { sourceRevision } from '../src/publishing/build.mjs'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-sqlite'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { randomUUID, randomBytes } from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'
import { mkdir, readFile, writeFile, cp, readdir, rename, symlink, lstat } from 'node:fs/promises'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { getPayload, handleEndpoints } from 'payload'
import sharp from 'sharp'
import { migrations } from '../src/migrations'
import { upgradePublicationDatabase } from '../scripts/prepare-publication-schema'
import { importLegacy } from '../src/publishing/import-legacy'
import { publishedContent, writePublicSnapshot } from '../src/publishing/content'
import { publishWebsite } from '../src/publishing/run'
import { publicationConfig } from '../src/publishing/config'
import { activeRelease, activateRelease, verifyWebsite, removeOwnedWork } from '../src/publishing/releases.mjs'
import { reconcilePublication, recoverInterruptedJobs } from '../src/publishing/worker'
import { validateSnapshot } from '../../src/features/cms/snapshot-posts.mjs'
import { combinePosts, legacyKeyFor, legacyRichText } from '../../src/features/cms/legacy-posts.mjs'
import { previewServer } from '../src/publishing/preview.mjs'

const exec=promisify(execFile)
const dataDir=path.resolve('.local/tests/publication-'+randomUUID())
const sourceDir=path.join(dataDir,'source')
await mkdir(path.join(sourceDir,'public/blog'),{recursive:true})
await writeFile(path.join(sourceDir,'package.json'),'{"private":true}')
const image=await sharp({create:{width:32,height:24,channels:3,background:'#3855a6'}}).png().toBuffer()
await writeFile(path.join(sourceDir,'public/blog/photo.png'),image)
const git=async(args:string[])=>exec('git',args,{cwd:sourceDir,windowsHide:true})
await git(['init','--initial-branch=cms'])
await git(['config','user.name','CMS local tests'])
await git(['config','user.email','cms-tests@example.test'])
await git(['add','.'])
await git(['commit','-m','Isolated publication fixture'])
Object.assign(process.env,{
  CMS_ENV:'local',CMS_URL:'http://127.0.0.1:3010',NODE_ENV:'test',
  PAYLOAD_SECRET:randomBytes(48).toString('hex'),CMS_DATA_DIR:dataDir,
  DATABASE_URL:'file:'+path.join(dataDir,'cms.db').replaceAll('\\','/'),CMS_SCHEMA_PUSH:'false',
  NORDLYS_PUBLISH_ENABLED:'true',NORDLYS_PUBLISH_MODE:'preview',NORDLYS_PUBLISH_SOURCE:sourceDir,
})
const {default:config}=await import('../src/payload.config')
const payload=await getPayload({config})
payload.logger.level='fatal'
const pub=publicationConfig()
const blogs=[
  {date:'September 2025',text:'Our first preserved story. The team completed a major milestone together.',images:['/blog/photo.png'],imageAlts:['Team at the first milestone']},
  {date:'August 2025',text:'Our second preserved story. This older update must remain available after the import.',images:['/blog/photo.png'],imageAlts:['Team preparing the car']},
]
const base='http://127.0.0.1:3010'
const password='Disposable publication test '+randomUUID()
async function account(role:'admin'|'publisher'|'marketing'){
  const user=await payload.create({collection:'users',context:{accountProvisioning:true},
    data:{name:role,email:randomUUID()+'@example.test',password,role,active:true}})
  const login=await payload.login({collection:'users',data:{email:user.email,password}})
  return {...user,token:login.token!}
}
async function request(url:string,token?:string,method='GET'){
  return handleEndpoints({config,path:new URL(url,base).pathname,request:new Request(base+url,{method,
    headers:{Origin:base,...(token?{Authorization:'JWT '+token}:{})}})})
}
const html=(props:unknown)=>'<html><script id="__NEXT_DATA__" type="application/json">'+JSON.stringify({props:{pageProps:props}})+'</script></html>'
async function fakeBuild(_config:unknown,workspace:string,snapshotFile:string,assets:string,_logFile?:string){
  const snapshot=JSON.parse(await readFile(snapshotFile,'utf8'))
  const out=path.join(workspace,'out')
  await mkdir(path.join(out,'blog'),{recursive:true})
  await cp(assets,path.join(out,'cms-media'),{recursive:true})
  const cards=snapshot.posts.map(({id,slug,title}:any)=>({id,slug,title}))
  await writeFile(path.join(out,'index.html'),html({cmsPosts:cards}))
  await writeFile(path.join(out,'blog.html'),html({cmsPosts:cards}))
  for(const post of snapshot.posts){
    await writeFile(path.join(out,'blog',String(post.id)+'.html'),html({post}))
    if(post.slug!==String(post.id))await writeFile(path.join(out,'blog',post.slug+'.html'),html({post}))
  }
  return out
}

test('durable website publication, legacy preservation and failure recovery',async t=>{
  try{
    await t.test('existing database upgrade is additive, backed up and repeatable',async()=>{
      await payload.db.migrate({migrations:migrations.slice(0,2).map(m=>({...m,up:(args:unknown)=>m.up(args as MigrateUpArgs),down:(args:unknown)=>m.down(args as MigrateDownArgs)}))})
      const db=new DatabaseSync(path.join(dataDir,'cms.db'))
      db.prepare('INSERT INTO posts (id,title,content,_status) VALUES (900,?,?,?)')
        .run('A private existing draft',JSON.stringify(legacyRichText('Do not lose my draft.')),'draft')
      db.exec("INSERT INTO _posts_v (parent_id,version_title,version__status) VALUES (900,'Older private version','draft')")
      db.close()
      const result=await upgradePublicationDatabase(path.join(dataDir,'cms.db'))
      assert.equal(result.upgraded,true)
      assert.ok(result.backupFile)
      const backup=new DatabaseSync(result.backupFile!)
      assert.equal(backup.prepare('SELECT title FROM posts WHERE id=900').get()?.title,'A private existing draft')
      assert.equal(backup.prepare("SELECT COUNT(*) AS n FROM pragma_table_info('posts') WHERE name='legacy_key'").get()?.n,0)
      backup.close()
      assert.equal((await payload.findByID({collection:'posts',id:900,draft:true})).title,'A private existing draft')
      const saved=new DatabaseSync(path.join(dataDir,'cms.db'))
      assert.equal(saved.prepare('SELECT version_title FROM _posts_v WHERE parent_id=900').get()?.version_title,'Older private version')
      saved.close()
      assert.equal((await upgradePublicationDatabase(path.join(dataDir,'cms.db'))).upgraded,false)
      await payload.db.migrate()
    })
    await t.test('live builds require clean main matching the fetched origin/main',async()=>{
      await assert.rejects(sourceRevision({...pub,mode:'live'}),/clean main/)
      await git(['branch','-m','main'])
      const original=await readFile(path.join(sourceDir,'package.json'))
      try{
        await assert.rejects(sourceRevision({...pub,mode:'live'}),/fetched origin/)
        const commit=(await git(['rev-parse','HEAD'])).stdout.trim()
        await git(['update-ref','refs/remotes/origin/main',commit])
        assert.equal(await sourceRevision({...pub,mode:'live'}),commit)
        await writeFile(path.join(sourceDir,'package.json'),'unreviewed change')
        await assert.rejects(sourceRevision({...pub,mode:'live'}),/clean main/)
      }finally{await writeFile(path.join(sourceDir,'package.json'),original);await git(['branch','-m','cms'])}
    })
    const admin=await account('admin')
    const publisher=await account('publisher')
    const writer=await account('marketing')
    let first:number
    let second:number
    await t.test('legacy import creates all stories once and preserves edits',async()=>{
      assert.deepEqual(await importLegacy(payload,blogs,sourceDir),{created:2,linked:0,kept:0,total:2})
      const posts=(await payload.find({collection:'posts',where:{legacyKey:{exists:true}},sort:'id',pagination:false})).docs
      first=posts[0].id;second=posts[1].id
      assert.equal((await payload.count({collection:'media'})).totalDocs,2)
      await payload.update({collection:'posts',id:first,data:{title:'Edited by our publisher'}})
      assert.deepEqual(await importLegacy(payload,blogs,sourceDir),{created:0,linked:0,kept:2,total:2})
      assert.equal((await payload.findByID({collection:'posts',id:first})).title,'Edited by our publisher')
      assert.equal((await payload.count({collection:'media'})).totalDocs,2)
    })
    await t.test('draft autosaves do not queue builds or leak into the public snapshot',async()=>{
      const before=(await payload.count({collection:'payload-jobs'})).totalDocs
      await payload.update({collection:'posts',id:first,draft:true,data:{title:'PRIVATE_UNPUBLISHED_TITLE',reviewNote:'PRIVATE_REVIEW_NOTE'}})
      assert.equal((await payload.count({collection:'payload-jobs'})).totalDocs,before)
      const content=await publishedContent(payload)
      const snapshot=await writePublicSnapshot(content,pub.uploadDir,path.join(dataDir,'snapshot'))
      const json=JSON.stringify(snapshot.snapshot)
      assert.ok(!json.includes('PRIVATE_UNPUBLISHED_TITLE'))
      assert.ok(!json.includes('PRIVATE_REVIEW_NOTE'))
      assert.ok(!json.includes('private existing draft'))
      assert.equal(snapshot.snapshot.posts.length,2)
      const firstPublic=snapshot.snapshot.posts.find((p:any)=>p.id===first)!
      assert.equal(firstPublic.title,'Edited by our publisher')
      const projected=validateSnapshot({...snapshot.snapshot,secret:'must disappear',posts:snapshot.snapshot.posts.map((p:any)=>({...p,reviewNote:'hidden',ownerId:writer.id}))})
      assert.ok(!JSON.stringify(projected).includes('reviewNote'))
      assert.ok(!JSON.stringify(projected).includes('ownerId'))
      assert.equal(new Set(snapshot.assets.map(a=>a.path)).size,snapshot.assets.length)
    })
    await t.test('an explicit publish queues an update even when the draft query option is present',async()=>{
      await payload.delete({collection:'payload-jobs',where:{id:{exists:true}}})
      await payload.update({collection:'posts',id:first,draft:true,data:{_status:'published',title:'Edited by our publisher',content:legacyRichText(blogs[0].text) as Post['content']}})
      assert.equal((await payload.count({collection:'payload-jobs',where:{completedAt:{exists:false},hasError:{not_equals:true}}})).totalDocs,1)
    })
    await t.test('anonymous/writer requests cannot execute jobs or request publication',async()=>{
      assert.equal((await request('/api/website-publication')).status,403)
      assert.equal((await request('/api/website-publication/retry',writer.token,'POST')).status,403)
      for(const url of ['/api/payload-jobs','/api/payload-jobs/run','/api/globals/website-publication','/api/legacy-imports']){
        assert.ok((await request(url,admin.token)).status>=400,url+' must stay private')
      }
      assert.equal((await request('/api/website-publication',writer.token)).status,200)
      assert.equal((await request('/api/website-publication/retry',publisher.token,'POST')).status,202)
      assert.ok((await payload.count({collection:'payload-jobs',where:{completedAt:{exists:false},hasError:{not_equals:true}}})).totalDocs<=1)
    })
    let initial:string
    await t.test('verified export activates a new release with working numeric and legacy routes',async()=>{
      const result=await publishWebsite(payload,{build:fakeBuild})
      initial=result.release
      assert.equal((await activeRelease(pub))?.manifest.releaseId,initial)
      assert.equal((await activeRelease(pub))?.manifest.postCount,2)
      assert.equal((await publishWebsite(payload,{build:async()=>{throw new Error('An unchanged export must not rebuild')}})).release,initial)
    })
    await t.test('failed build retains the exact previously active version',async()=>{
      await payload.update({collection:'posts',id:second,data:{title:'A new approved title'}})
      await assert.rejects(publishWebsite(payload,{build:async()=>{throw new Error('Deliberate build failure')}}),/Deliberate/)
      assert.equal((await activeRelease(pub))?.manifest.releaseId,initial)
      const state=await payload.findGlobal({slug:'website-publication'})
      assert.ok(state.failedAt)
      assert.match(state.error!,/previous version/)
      assert.equal((await readdir(pub.workDir)).length,0)
    })
    await t.test('private fields or damaged photos reject the export before activation',async()=>{
      await assert.rejects(publishWebsite(payload,{build:async(...args)=>{
        const out=await fakeBuild(...args)
        await writeFile(path.join(out,'blog.html'),html({cmsPosts:[],reviewNote:'Must not ship'}))
        return out
      }}),/Private editorial/)
      assert.equal((await activeRelease(pub))?.manifest.releaseId,initial)
      await assert.rejects(publishWebsite(payload,{build:async(...args)=>{
        const out=await fakeBuild(...args)
        const name=(await readdir(path.join(out,'cms-media')))[0]
        await writeFile(path.join(out,'cms-media',name),'corrupted')
        return out
      }}),/checksum/)
      assert.equal((await activeRelease(pub))?.manifest.releaseId,initial)
    })
    await t.test('a newer approval during a build prevents stale content activation',async()=>{
      await assert.rejects(publishWebsite(payload,{build:async(...args)=>{
        const out=await fakeBuild(...args)
        await payload.update({collection:'posts',id:second,data:{title:'A newer approval made during the build'}})
        return out
      }}),/content changed during/)
      assert.equal((await activeRelease(pub))?.manifest.releaseId,initial)
    })
    await t.test('missing published files fail before activation',async()=>{
      const content=await publishedContent(payload)
      const file=path.join(pub.uploadDir,content.media[0].filename!)
      await rename(file,file+'.temporarily-missing')
      try{
        await assert.rejects(publishWebsite(payload,{build:fakeBuild}),/ENOENT/)
        assert.equal((await activeRelease(pub))?.manifest.releaseId,initial)
      }finally{await rename(file+'.temporarily-missing',file)}
    })
    await t.test('missed queues and interrupted jobs are recovered by reconciliation',async()=>{
      await payload.delete({collection:'payload-jobs',where:{id:{exists:true}}})
      await reconcilePublication(payload,pub)
      assert.equal((await payload.count({collection:'payload-jobs'})).totalDocs,0,'a recent failed build waits before automatic retry')
      await payload.updateGlobal({slug:'website-publication',data:{failedAt:null,failedHash:null}})
      await reconcilePublication(payload,pub)
      const queued=(await payload.find({collection:'payload-jobs',where:{hasError:{not_equals:true}},pagination:false})).docs
      assert.equal(queued.length,1)
      await payload.update({collection:'payload-jobs',id:queued[0].id,data:{processing:true}})
      await recoverInterruptedJobs(payload)
      assert.equal((await payload.findByID({collection:'payload-jobs',id:queued[0].id})).processing,false)
      assert.equal((await payload.findByID({collection:'payload-jobs',id:queued[0].id})).hasError,true)
      await payload.updateGlobal({slug:'website-publication',data:{failedAt:null,failedHash:null}})
      await reconcilePublication(payload,pub)
      assert.equal((await payload.count({collection:'payload-jobs',where:{hasError:{not_equals:true},completedAt:{exists:false}}})).totalDocs,1)
    })
    await t.test('unpublish and deletion never resurrect a managed legacy article',async()=>{
      await payload.update({collection:'posts',id:second,draft:false,data:{_status:'draft'}})
      await payload.delete({collection:'posts',id:first})
      const result=await importLegacy(payload,blogs,sourceDir)
      assert.equal(result.created,0)
      assert.equal((await payload.find({collection:'posts',where:{legacyKey:{equals:legacyKeyFor(blogs[0])}}})).docs.length,0)
      const current=await publishedContent(payload)
      assert.equal(current.posts.length,0)
      assert.equal(combinePosts([],current.managedLegacyKeys,blogs).length,0)
      const published=await publishWebsite(payload,{build:fakeBuild})
      assert.notEqual(published.release,initial)
      assert.equal((await activeRelease(pub))?.manifest.postCount,0)
      await activateRelease(pub,initial)
      assert.equal((await activeRelease(pub))?.manifest.releaseId,initial)
      await activateRelease(pub,published.release)
    })
    await t.test('Linux live activation swaps an owned symlink and preserves existing directories',{skip:process.platform==='win32'},async()=>{
      const live={...pub,mode:'live',activePath:path.join(dataDir,'live-current')}
      const current=(await activeRelease(pub))!
      await activateRelease(live,current.manifest.releaseId)
      assert.equal((await lstat(live.activePath)).isSymbolicLink(),true)
      await activateRelease(live,initial)
      assert.equal((await activeRelease(live))?.manifest.releaseId,initial)
      const oldDirectory={...live,activePath:path.join(dataDir,'old-website')}
      await mkdir(oldDirectory.activePath)
      await writeFile(path.join(oldDirectory.activePath,'index.html'),'keep the old website')
      await assert.rejects(activateRelease(oldDirectory,initial),/owned symlink/)
      assert.equal(await readFile(path.join(oldDirectory.activePath,'index.html'),'utf8'),'keep the old website')
      const unknown={...live,activePath:path.join(dataDir,'unknown-current')}
      await symlink(sourceDir,unknown.activePath,'dir')
      await assert.rejects(activateRelease(unknown,initial),/outside/)
    })
    await t.test('invalid pointers fail safely; cleanup stays within owned storage',async()=>{
      const pointer=await readFile(pub.activePath)
      await writeFile(pub.activePath,JSON.stringify({releaseId:'../../private'}))
      await assert.rejects(activeRelease(pub),/Invalid website release/)
      await writeFile(pub.activePath,pointer)
      await assert.rejects(removeOwnedWork(pub.workDir,dataDir),/outside/)
      const sentinel=path.join(dataDir,'private-marker')
      await writeFile(sentinel,'keep')
      assert.equal(await readFile(sentinel,'utf8'),'keep')
      const bad=path.join(dataDir,'partial.db')
      const db=new DatabaseSync(bad);db.exec('CREATE TABLE posts (id integer, legacy_key text)');db.close()
      await assert.rejects(upgradePublicationDatabase(bad),/Partial/)
    })
    await t.test('local static preview serves only the active release',async()=>{
      const server=previewServer(pub)
      await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve))
      try{
        const address=server.address() as {port:number}
        const origin='http://127.0.0.1:'+address.port
        const page=await fetch(origin+'/blog')
        assert.equal(page.status,200)
        assert.equal(page.headers.get('cache-control'),'no-store')
        assert.equal((await fetch(origin+'/%2e%2e%2fprivate-marker')).status,503)
        assert.equal((await fetch(origin+'/snapshot.json')).status,404)
      }finally{await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()))}
    })
  }finally{await payload.destroy()}
})
