import { randomUUID, randomBytes } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'
const dataDir=path.resolve('.local/browser/run-'+randomUUID())
await mkdir(dataDir,{recursive:true,mode:0o700})
const env={...process.env,CMS_ENV:'local',CMS_URL:'http://127.0.0.1:3010',CMS_DATA_DIR:dataDir,
  DATABASE_URL:'file:'+path.join(dataDir,'cms.db').replaceAll('\\','/'),CMS_SCHEMA_PUSH:'false',
  PAYLOAD_SECRET:randomBytes(48).toString('hex'),NODE_ENV:'development',NEXT_TELEMETRY_DISABLED:'1',
  NORDLYS_BROWSER_DATA_DIR:dataDir,NORDLYS_PUBLISH_ENABLED:'true',NORDLYS_PUBLISH_MODE:'preview',
  NORDLYS_PUBLISH_SOURCE:path.resolve('..'),NORDLYS_PUBLISH_RELEASES:path.join(dataDir,'publishing/releases'),
  NORDLYS_PUBLISH_ACTIVE:path.join(dataDir,'publishing/active.json'),NORDLYS_WEBSITE_URL:'http://127.0.0.1:4178'}
await writeFile('.local/browser/last-run.json',JSON.stringify({dataDir}),{mode:0o600})
async function run(args){
  await new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,args,{env,windowsHide:true,stdio:'inherit'})
    child.once('error',reject)
    child.once('exit',code=>code===0?resolve():reject(new Error('Browser validation exited with code '+code)))
  })
}
await run(['--import','tsx','scripts/setup-browser.ts'])
await run(['node_modules/@playwright/test/cli.js','test',...process.argv.slice(2)])
