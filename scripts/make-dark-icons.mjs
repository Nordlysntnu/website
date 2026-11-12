// Makes dark-mode versions of the two-colour icons (navy + pink).
// The navy lines become light so they show on a dark background; pink is kept.
// Run from the repo root after changing an icon: node scripts/make-dark-icons.mjs
import sharp from 'sharp';

const dir = 'src/assets/symbols-and-logos/';
const icons = [
    '2025Goal', 'TeamGoal', 'NorwayGoal',
    'Management', 'Business', 'Marketing', 'Logistics',
    'Chassis', 'Mechanical', 'EmbeddedElectronics', 'Software',
];

const navy = [0x3a, 0x48, 0x6a];
const pink = [0xff, 0x51, 0x82];
const light = [0xdf, 0xe5, 0xf0];
const maxSize = 320; // shown at 50–72px, so this covers high-density screens

// How pink a pixel is (0 = navy, 1 = pink), from red minus blue.
const navySpread = navy[0] - navy[2];
const pinkSpread = pink[0] - pink[2];
const pinkness = (r, b) => Math.min(1, Math.max(0, (r - b - navySpread) / (pinkSpread - navySpread)));

for (const name of icons) {
    const { data, info } = await sharp(`${dir}${name}.png`)
        .ensureAlpha()
        .resize(maxSize, maxSize, { fit: 'inside', withoutEnlargement: true })
        .raw()
        .toBuffer({ resolveWithObject: true });

    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue;
        const shift = 1 - pinkness(data[i], data[i + 2]);
        for (let c = 0; c < 3; c++) {
            data[i + c] = Math.round(Math.min(255, Math.max(0, data[i + c] + shift * (light[c] - navy[c]))));
        }
    }

    await sharp(data, { raw: info }).png({ compressionLevel: 9 }).toFile(`${dir}${name}Dark.png`);
    console.log(`${name}Dark.png ${info.width}x${info.height}`);
}
