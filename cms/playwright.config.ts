import { defineConfig } from '@playwright/test'
import path from 'node:path'
const dataDir=process.env.NORDLYS_BROWSER_DATA_DIR
if(!dataDir)throw new Error('Run npm run test:browser; it creates an isolated database.')
export default defineConfig({
  testDir:'./tests/browser',fullyParallel:false,workers:1,retries:0,timeout:120000,
  outputDir:path.join(dataDir,'results'),reporter:[['list'],['html',{outputFolder:path.join(dataDir,'report'),open:'never'}]],
  expect:{timeout:15000},use:{baseURL:'http://127.0.0.1:3010',viewport:{width:1280,height:900},
    colorScheme:'light',actionTimeout:20000,trace:'off',screenshot:{mode:'only-on-failure',fullPage:true},navigationTimeout:120000},
  webServer:[
    {command:'npm run dev',url:'http://127.0.0.1:3010/admin/login',reuseExistingServer:false,timeout:180000,
      gracefulShutdown:process.platform==='win32'?undefined:{signal:'SIGTERM',timeout:10000}},
    {command:'npm run publish:preview',url:'http://127.0.0.1:4178/__preview-health',reuseExistingServer:false,timeout:30000,
      gracefulShutdown:process.platform==='win32'?undefined:{signal:'SIGTERM',timeout:5000}},
  ],
})
