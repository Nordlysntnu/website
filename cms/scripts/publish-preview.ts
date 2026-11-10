import { existsSync } from 'node:fs'
import { publicationConfig } from '../src/publishing/config'
import { previewServer } from '../src/publishing/preview.mjs'
if (existsSync('.env.local')) process.loadEnvFile('.env.local')
const config = publicationConfig()
const server = previewServer(config)
server.listen(4178,'127.0.0.1',() => console.log('Static CMS website preview: http://127.0.0.1:4178'))
for (const signal of ['SIGINT','SIGTERM']) process.on(signal,() => server.close())
