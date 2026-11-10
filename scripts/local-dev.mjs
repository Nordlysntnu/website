import { access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';
import net from 'node:net';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cms = path.join(root, 'cms');
const node = path.join(cms, 'node_modules/node/bin', process.platform === 'win32' ? 'node.exe' : 'node');
const children = [];
let stopping = false;
async function stop(code = 0) {
    if (stopping) return;
    stopping = true;
    for (const child of children) {
        if (child.exitCode !== null || child.signalCode !== null) continue;
        try {
            if (process.platform === 'win32') execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore', timeout: 5000 });
            else process.kill(-child.pid, 'SIGTERM');
        } catch { child.kill(); }
    }
    process.exitCode = code;
}
process.on('SIGINT', () => void stop());
process.on('SIGTERM', () => void stop());
async function freePort(port) {
    await new Promise((resolve, reject) => {
        const server = net.createServer();
        server.once('error', () => reject(new Error('Port ' + port + ' is in use or unavailable. Stop the existing local server first.')));
        server.listen(port, '127.0.0.1', () => server.close(resolve));
    });
}
function start(directory, port) {
    const env = { ...process.env, NODE_ENV: 'development', NEXT_TELEMETRY_DISABLED: '1',
        NEXT_PUBLIC_LOCAL_PREVIEW: 'true', CMS_URL: 'http://127.0.0.1:3010',
        DATABASE_URL: 'file:./.local/cms.db', CMS_SCHEMA_PUSH: 'false' };
    delete env.PAYLOAD_CONFIG_PATH;
    delete env.PAYLOAD_SECRET; // Next loads the local CMS secret from cms/.env.local.
    const child = spawn(node, [path.join(directory, 'node_modules/next/dist/bin/next'), 'dev', '--webpack', '--hostname', '127.0.0.1', '--port', String(port)],
        { cwd: directory, env, stdio: 'inherit', windowsHide: true, detached: process.platform !== 'win32' });
    children.push(child);
    child.on('error', (error) => { console.error(error.message); void stop(1); });
    child.on('exit', (code) => { if (!stopping) { console.error('Local service on port ' + port + ' stopped.'); void stop(code || 1); } });
    return child;
}
try {
    for (const file of [node, path.join(root, 'node_modules/next/dist/bin/next'), path.join(cms, 'node_modules/next/dist/bin/next'), path.join(cms, '.env.local'), path.join(cms, '.local/cms.db')]) await access(file);
    console.log('Local dependencies, configuration and database found.');
    if (!process.argv.includes('--check')) {
        await freePort(3000); await freePort(3010);
        start(cms, 3010);
        let ready = false;
        for (let attempt = 0; attempt < 90 && !stopping; attempt++) {
            try { ready = (await fetch('http://127.0.0.1:3010/api/users/me', { signal: AbortSignal.timeout(1500), redirect: 'error' })).ok; } catch {}
            if (ready) break;
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        if (!ready || stopping) throw new Error('The local CMS did not become ready. Check its output above.');
        start(root, 3000);
        console.log('Website: http://127.0.0.1:3000 | CMS: http://127.0.0.1:3010/admin');
        console.log('Only published CMS posts appear on the website. Refresh the website after publishing. Ctrl+C stops both services.');
    }
} catch (error) {
    console.error(error.message);
    console.error('First run npm ci, npm --prefix cms ci, then npm run local:setup. Keep other dev servers stopped.');
    await stop(1);
}
