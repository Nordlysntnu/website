import { randomUUID } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
if(process.env.CMS_ENV!=='local'||!process.env.NORDLYS_BROWSER_DATA_DIR||process.env.CMS_DATA_DIR!==process.env.NORDLYS_BROWSER_DATA_DIR)throw new Error('Use test:browser for isolated browser fixtures.')
const {default:config}=await import('../src/payload.config')
const {blogs}=await import('../../src/shared/data/blog')
const {importLegacy}=await import('../src/publishing/import-legacy')
const payload=await getPayload({config})
try{
  await payload.db.migrate()
  const accounts=[]
  for(const role of ['admin','publisher'] as const){
    const account={name:role==='admin'?'Browser Administrator':'Browser Publisher',role,email:role+'@browser.example.test',password:'Disposable browser password '+randomUUID(),active:true}
    await payload.create({collection:'users',context:{accountProvisioning:true},data:account})
    accounts.push(account)
  }
  await writeFile(path.join(process.env.CMS_DATA_DIR!,'accounts.json'),JSON.stringify(accounts),{mode:0o600})
  console.log('Legacy browser fixture:',await importLegacy(payload,blogs,path.resolve('..')))
}finally{await payload.destroy()}
