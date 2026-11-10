import path from 'node:path'
import { cmsRuntime } from '../lib/runtime'
const contains = (root: string, file: string) => {
  const relative = path.relative(root, file)
  return !relative || (relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative))
}
export function publicationConfig(env: Record<string,string|undefined> = process.env) {
  const runtime = cmsRuntime(env)
  const enabled = env.NORDLYS_PUBLISH_ENABLED === 'true'
  const mode = env.NORDLYS_PUBLISH_MODE || 'preview'
  if (!['preview','live'].includes(mode)) throw new Error('Choose preview or live publication mode.')
  if (runtime.production && enabled && mode !== 'live') throw new Error('Production publication requires live mode.')
  if (!runtime.production && mode === 'live') throw new Error('Local mode cannot activate the live website.')
  const sourceDir = path.resolve(env.NORDLYS_PUBLISH_SOURCE || '..')
  const releaseDir = path.resolve(env.NORDLYS_PUBLISH_RELEASES || path.join(runtime.dataDir,'publishing/releases'))
  const activePath = path.resolve(env.NORDLYS_PUBLISH_ACTIVE || path.join(runtime.dataDir,'publishing/active.json'))
  const workDir = path.join(runtime.dataDir,'publishing/work')
  const uploadDir = path.join(runtime.dataDir,'uploads')
  const websiteURL = env.NORDLYS_WEBSITE_URL || (mode === 'preview' ? 'http://127.0.0.1:4178' : 'https://www.nordlysntnu.no')
  const url = new URL(websiteURL)
  if (!['http:','https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash ||
      (mode==='live' && url.protocol!=='https:')) throw new Error('Invalid website URL.')
  if (enabled) {
    if (mode==='live' && (!env.NORDLYS_PUBLISH_RELEASES || !env.NORDLYS_PUBLISH_ACTIVE)) throw new Error('Set explicit release and active paths before live publication.')
    for (const output of [releaseDir,workDir,activePath]) {
      if (contains(output,sourceDir) || contains(uploadDir,output) || contains(output,uploadDir)) throw new Error('Publication output must be separate from source and private uploads.')
      for (const protectedName of ['src','components','public','node_modules']) {
        const protectedPath = path.join(sourceDir,protectedName)
        if (contains(protectedPath,output) || contains(output,protectedPath)) throw new Error('Publication storage cannot replace website source or public assets.')
      }
    }
    if (contains(releaseDir,workDir) || contains(workDir,releaseDir) || contains(releaseDir,activePath) || contains(workDir,activePath)) throw new Error('Use separate work, release and active paths.')
    if (mode==='live' && (contains(runtime.dataDir,releaseDir) || contains(runtime.dataDir,activePath))) throw new Error('Public releases must be outside private CMS storage.')
  }
  return { enabled, mode:mode as 'preview'|'live', sourceDir, releaseDir, activePath, websiteURL:url.origin,
    workDir, uploadDir, dataDir:runtime.dataDir, production:runtime.production }
}
