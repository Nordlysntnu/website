import { createServer } from 'node:http'
import { readFile, stat, realpath } from 'node:fs/promises'
import path from 'node:path'
import { activeRelease, within } from './releases.mjs'

const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp',
  '.svg':'image/svg+xml','.ico':'image/x-icon','.woff':'font/woff','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'}
export function previewServer(config) {
  if (config.mode !== 'preview') throw new Error('The local preview server cannot serve a live target.')
  return createServer(async (req,res) => {
    res.setHeader('Cache-Control','no-store')
    res.setHeader('X-Content-Type-Options','nosniff')
    if (!['GET','HEAD'].includes(req.method || '')) {res.writeHead(405).end();return}
    if(req.url==='/__preview-health'){res.writeHead(200).end('ok');return}
    try {
      const active = await activeRelease(config)
      if (!active) {res.writeHead(503).end('Build a local website preview first.');return}
      const pathname = decodeURIComponent(new URL(req.url || '/', 'http://127.0.0.1').pathname)
      if (/[\\\x00]/.test(pathname) || pathname.split('/').includes('..')) throw new Error('Invalid path')
      const base = path.resolve(active.dir)
      const relative = pathname.replace(/^\/+/, '')
      const options = pathname === '/' ? ['index.html'] : [relative, relative + '.html', path.join(relative,'index.html')]
      for (const name of options) {
        const file = path.resolve(base,name)
        if (!within(base,file)) continue
        const metadata = await stat(file).catch(() => null)
        if (!metadata?.isFile() || !within(base,await realpath(file))) continue
        const bytes = await readFile(file)
        res.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream','Content-Length':bytes.length})
        res.end(req.method === 'HEAD' ? undefined : bytes)
        return
      }
      res.writeHead(404).end('Page not found.')
    } catch {res.writeHead(503).end('The local website preview is unavailable.')}
  })
}
