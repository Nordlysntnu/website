// Shared rules for "Adopt a solar panel", used by the website and the CMS.
// The CMS always recalculates the price itself; the website only shows it.

export const BUNDLES = [
    { panels: 1, price: 100 },
    { panels: 5, price: 399 },
    { panels: 10, price: 699 },
];

export const MAX_PANELS_PER_ORDER = 50;
export const HOLD_MINUTES = 15; // A chosen panel is held this long while the buyer pays.
export const NAME_MAX = 40;

const single = BUNDLES.find(bundle => bundle.panels === 1).price;

// Cheapest combination of bundles for exactly `count` panels.
export function priceFor(count) {
    if (!Number.isInteger(count) || count < 0 || count > MAX_PANELS_PER_ORDER) {
        throw new RangeError(`Choose between 0 and ${MAX_PANELS_PER_ORDER} panels.`);
    }
    const cost = [0];
    const pick = [null];
    for (let n = 1; n <= count; n++) {
        cost[n] = Infinity;
        for (const bundle of BUNDLES) {
            if (bundle.panels <= n && cost[n - bundle.panels] + bundle.price < cost[n]) {
                cost[n] = cost[n - bundle.panels] + bundle.price;
                pick[n] = bundle;
            }
        }
    }
    const used = new Map();
    for (let n = count; n > 0; n -= pick[n].panels) used.set(pick[n], (used.get(pick[n]) ?? 0) + 1);
    const parts = BUNDLES.filter(bundle => used.has(bundle))
        .sort((a, b) => b.panels - a.panels)
        .map(bundle => ({ ...bundle, times: used.get(bundle) }));
    const total = cost[count];
    return { count, total, parts, saved: count * single - total };
}

// Removes control and invisible characters, squeezes spaces and shortens the name.
export function cleanName(value) {
    return String(value ?? '')
        .normalize('NFC')
        .replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩﻿]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, NAME_MAX);
}

// Placeholder car seen from above. Replace with the new car shape when it is ready;
// keep the panel ids stable once panels have been adopted.
export const CAR = { width: 1000, height: 440 };

function superellipse(cx, cy, rx, ry, exponent, x, y) {
    return Math.abs((x - cx) / rx) ** exponent + Math.abs((y - cy) / ry) ** exponent <= 1;
}

function superellipsePath(cx, cy, rx, ry, exponent, steps = 144) {
    const points = [];
    for (let i = 0; i < steps; i++) {
        const t = (i / steps) * 2 * Math.PI;
        const cos = Math.cos(t);
        const sin = Math.sin(t);
        const x = cx + rx * Math.sign(cos) * Math.abs(cos) ** (2 / exponent);
        const y = cy + ry * Math.sign(sin) * Math.abs(sin) ** (2 / exponent);
        points.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return `M${points.join(' L')} Z`;
}

const body = { cx: 500, cy: 220, rx: 470, ry: 200, exponent: 3.2 };
const array = { cx: 515, cy: 220, rx: 420, ry: 168, exponent: 4 };
export const CANOPY = { cx: 250, cy: 220, rx: 78, ry: 58 };

const cell = 38;
const gap = 4;
const cols = 21;
const rows = 8;
const x0 = array.cx - (cols * cell) / 2;
const y0 = array.cy - (rows * cell) / 2;

function insideArray(x, y) {
    const corners = [[x, y], [x + cell - gap, y], [x, y + cell - gap], [x + cell - gap, y + cell - gap]];
    return corners.every(([px, py]) => superellipse(array.cx, array.cy, array.rx, array.ry, array.exponent, px, py))
        && !corners.some(([px, py]) => superellipse(CANOPY.cx, CANOPY.cy, CANOPY.rx + 10, CANOPY.ry + 10, 2, px, py));
}

export const BODY_PATH = superellipsePath(body.cx, body.cy, body.rx, body.ry, body.exponent);

export const PANELS = [];
for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const x = x0 + col * cell;
        const y = y0 + row * cell;
        if (insideArray(x, y)) {
            PANELS.push({ id: `${String.fromCharCode(65 + row)}${col + 1}`, row, col, x, y, size: cell - gap });
        }
    }
}

const panelIds = new Set(PANELS.map(panel => panel.id));
export const isPanelId = id => typeof id === 'string' && panelIds.has(id);

// Checks a list of panel ids from a buyer: known ids, no repeats, within the limit.
export function validPanelSelection(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return 'Choose at least one panel.';
    if (ids.length > MAX_PANELS_PER_ORDER) return `You can adopt up to ${MAX_PANELS_PER_ORDER} panels at a time.`;
    if (new Set(ids).size !== ids.length) return 'A panel was chosen twice.';
    if (!ids.every(isPanelId)) return 'Unknown panel.';
    return null;
}
