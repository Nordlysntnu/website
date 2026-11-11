import { execFileSync } from 'node:child_process';
import { mkdir, writeFile, lstat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeSourceZip, verifySourceZip } from './lib/source-zip.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, '.local/portable');
await mkdir(out, { recursive: true });
const env = { ...process.env, GIT_CONFIG_GLOBAL: process.platform === 'win32' ? 'NUL' : '/dev/null', GIT_CONFIG_NOSYSTEM: '1' };
const entries = [...new Set(execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, env, encoding: 'utf8' }).split('\0').filter(Boolean))];
const files = entries.filter((file) => !/(^|\/)(\.git|node_modules|\.next[^/]*|out|build|\.local)(\/|$)/i.test(file)
    && !/(^|\/)\.env(?!\.example$)/i.test(file) && !/\.(db|sqlite|sqlite3|pem|key|log|zip|tsbuildinfo)$/i.test(file));
for (const file of files) {
    const absolute = path.resolve(root, file);
    if (!absolute.startsWith(root + path.sep)) throw new Error('Path outside repository: ' + file);
    if (!(await lstat(absolute)).isFile()) throw new Error('Only regular source files may be packaged: ' + file);
}
const manifest = path.join(out, 'source-files.txt');
await writeFile(manifest, files.join('\0') + '\0');
const archive = path.join(out, 'nordlys-local-test.zip');
await writeSourceZip(root, files, archive);
const verified = await verifySourceZip(archive, files);
console.log('ZIP verified: ' + JSON.stringify(verified));
console.log('Portable source snapshot: ' + archive);
console.log(files.length + ' files; includes current uncommitted changes. No Git history, installed dependencies, database, uploads or credentials.');
