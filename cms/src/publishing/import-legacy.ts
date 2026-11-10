import sharp from 'sharp'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Payload } from 'payload'
import type { Post } from '../payload-types'
import { legacyKeyFor, legacyProjection, legacyRichText } from '../../../src/features/cms/legacy-posts.mjs'
import { cmsRuntime } from '../lib/runtime'
import { hash } from './content'
import { requestPublication } from './queue'
type Blog = {legacyKey?:string;text:string;date:string;images:string[];imageAlts?:string[];imageFit?:string}
const plain = (value:unknown):string => !value || typeof value!=='object' ? '' : Array.isArray(value)
  ? value.map(plain).join(' ') : 'text' in value && typeof value.text==='string' ? value.text
  : plain('root' in value ? value.root : 'children' in value ? value.children : null)
const normalized=(text:string)=>text.replace(/\s+/g,' ').trim()
export async function importLegacy(payload:Payload,blogs:Blog[],sourceDir:string) {
  let created=0,linked=0,kept=0
  for(const blog of blogs){
    const key=legacyKeyFor(blog)
    const known=(await payload.find({collection:'legacy-imports',where:{key:{equals:key}},overrideAccess:true,limit:1})).docs[0]
    if(known){kept++;continue} // Deleted/unpublished managed articles are never resurrected.
    let post=(await payload.find({collection:'posts',where:{legacyKey:{equals:key}},draft:false,overrideAccess:true,depth:1,limit:1})).docs[0]
    if(!post && blog.images.some(image=>image.includes('01-team-belgium'))){
      const seed=(await payload.find({collection:'posts',where:{title:{equals:'Our first competition — Belgium 2026'}},
        draft:false,overrideAccess:true,depth:1,limit:1})).docs[0]
      if(seed){
        if(seed.ownerId || normalized(plain(seed.content))!==normalized(blog.text)||seed.summary||seed.authorName)throw new Error('The existing Belgium demo article has edits. Review its legacy mapping before importing.')
        if(seed.gallery?.length!==blog.images.length)throw new Error('The existing Belgium gallery needs review before importing.')
        for(const [index,row] of seed.gallery.entries()){
          const image=typeof row.image==='object' ? row.image : null
          if(!image?.filename||image.filename!==path.basename(image.filename))throw new Error('Invalid demo photo.')
          const original=await readFile(path.join(sourceDir,'public',blog.images[index].slice(1)))
          const copy=await readFile(path.join(cmsRuntime().dataDir,'uploads',image.filename))
          const unchanged=hash(original)===hash(copy)||hash(await sharp(original).rotate().toBuffer())===hash(copy)
          if(!unchanged||image.alt!==blog.imageAlts?.[index])throw new Error('The existing Belgium photos have edits; review the mapping first.')
        }
        post=seed
      }
    }
    if(post){
      if(!post.legacyKey)post=await payload.update({collection:'posts',id:post.id,overrideAccess:true,
        context:{legacyImport:true,skipWebsitePublication:true},data:{legacyKey:key}})
      linked++
    }else{
      const gallery=[]
      for(const [index,url] of blog.images.entries()){
        if(!url.startsWith('/blog/')||url.split('/').includes('..')||url.includes('\\'))throw new Error('Unsafe legacy image path.')
        const bytes=await readFile(path.join(sourceDir,'public',url.slice(1)))
        const source=key+':'+index+':'+hash(bytes)
        let media=(await payload.find({collection:'media',where:{legacySource:{equals:source}},overrideAccess:true,limit:1})).docs[0]
        if(!media)media=await payload.create({collection:'media',overrideAccess:true,
          context:{legacyImport:true,skipWebsitePublication:true},
          data:{alt:blog.imageAlts?.[index]||'Nordlys team photo',legacySource:source},
          filePath:path.join(sourceDir,'public',url.slice(1))})
        gallery.push({image:media.id})
      }
      const old=legacyProjection(blog)
      post=await payload.create({collection:'posts',overrideAccess:true,context:{legacyImport:true,skipWebsitePublication:true},
        data:{legacyKey:key,title:old.title,content:legacyRichText(blog.text) as Post['content'],gallery,
          publishedAt:old.publishedAt,department:'Team',review:'writing',_status:'published',
          imageFit:blog.imageFit==='cover'?'cover':'contain'}})
      created++
    }
    await payload.create({collection:'legacy-imports',overrideAccess:true,data:{key,postId:post.id}})
  }
  if(created||linked)await requestPublication(payload)
  return {created,linked,kept,total:blogs.length}
}
