import { open, readFile } from 'node:fs/promises';
import path from 'node:path';
import { deflateRawSync, inflateRawSync } from 'node:zlib';

const table = Array.from({ length: 256 }, (_, index) => {
    let value = index;
    for (let bit = 0; bit < 8; bit++) value = (value & 1) ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    return value >>> 0;
});
export function crc32(bytes) {
    let value = 0xffffffff;
    for (const byte of bytes) value = table[(value ^ byte) & 255] ^ (value >>> 8);
    return (value ^ 0xffffffff) >>> 0;
}
// ZIP32 with UTF-8 filenames, using only Node's standard library.
export async function writeSourceZip(root, files, output) {
    if (files.length >= 65535) throw new Error('Too many source files for ZIP32.');
    const handle = await open(output, 'w');
    const central = [];
    let offset = 0;
    try {
        for (const file of files) {
            const name = Buffer.from(file.replaceAll(path.sep, '/'));
            const bytes = await readFile(path.join(root, file));
            const compressed = deflateRawSync(bytes);
            const crc = crc32(bytes);
            if (name.length > 65535 || bytes.length >= 0xffffffff || offset + compressed.length + name.length + 30 >= 0xffffffff) throw new Error('Source archive exceeds ZIP32 limits.');
            const local = Buffer.alloc(30);
            local.writeUInt32LE(0x04034b50); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x800, 6);
            local.writeUInt16LE(8, 8); local.writeUInt16LE(33, 12); local.writeUInt32LE(crc, 14);
            local.writeUInt32LE(compressed.length, 18); local.writeUInt32LE(bytes.length, 22); local.writeUInt16LE(name.length, 26);
            await handle.writeFile(local); await handle.writeFile(name); await handle.writeFile(compressed);
            const entry = Buffer.alloc(46);
            entry.writeUInt32LE(0x02014b50); entry.writeUInt16LE(20, 4); entry.writeUInt16LE(20, 6);
            entry.writeUInt16LE(0x800, 8); entry.writeUInt16LE(8, 10); entry.writeUInt16LE(33, 14);
            entry.writeUInt32LE(crc, 16); entry.writeUInt32LE(compressed.length, 20); entry.writeUInt32LE(bytes.length, 24);
            entry.writeUInt16LE(name.length, 28); entry.writeUInt32LE(offset, 42);
            central.push(entry, name);
            offset += local.length + name.length + compressed.length;
        }
        const directory = Buffer.concat(central);
        const end = Buffer.alloc(22);
        end.writeUInt32LE(0x06054b50); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
        end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
        await handle.writeFile(directory); await handle.writeFile(end);
    } finally { await handle.close(); }
}
export async function verifySourceZip(output, expectedFiles) {
    const bytes = await readFile(output);
    const names = [];
    let offset = 0;
    while (offset + 30 <= bytes.length && bytes.readUInt32LE(offset) === 0x04034b50) {
        const compressedSize = bytes.readUInt32LE(offset + 18);
        const size = bytes.readUInt32LE(offset + 22);
        const nameLength = bytes.readUInt16LE(offset + 26);
        const extraLength = bytes.readUInt16LE(offset + 28);
        const name = bytes.subarray(offset + 30, offset + 30 + nameLength).toString('utf8');
        const start = offset + 30 + nameLength + extraLength;
        const data = inflateRawSync(bytes.subarray(start, start + compressedSize));
        if (data.length !== size || crc32(data) !== bytes.readUInt32LE(offset + 14)) throw new Error('CRC mismatch for ' + name);
        names.push(name); offset = start + compressedSize;
    }
    if (JSON.stringify(names) !== JSON.stringify(expectedFiles.map((file) => file.replaceAll(path.sep, '/')))) throw new Error('Archive entries differ from source manifest.');
    if (bytes.readUInt32LE(bytes.length - 22) !== 0x06054b50 || bytes.readUInt16LE(bytes.length - 12) !== names.length) throw new Error('Invalid ZIP directory.');
    return { files: names.length, bytes: bytes.length, crcVerified: true };
}
