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

// The car seen from above, as in the team's drawing of the solar array: standing up, rear at the top
// and nose at the bottom. Each module is a block of solar cells, and each cell is one panel to adopt.
// A normal cell lies across the car; in modules marked turned the cells are turned 90 degrees.
// Panel ids are the module letter and the cell number, for example C17. Keep them stable once panels are adopted.
const CELL = { across: 38, along: 20 };
const MODULES = [
    // letter, left and top (measured from the rear left corner of the array), rows, columns, turned
    ['A', 0, 0, 12, 4], ['B', 152, 0, 12, 4],
    ['C', 0, 240, 12, 4], ['D', 152, 240, 12, 4],
    ['E', 0, 480, 9, 4], ['F', 152, 480, 9, 4],
    ['G', 0, 660, 1, 5, true], ['H', 204, 660, 1, 5, true],
    ['J', 12, 698, 12, 2], ['K', 214, 698, 10, 1], ['L', 252, 698, 12, 1],
    ['M', 34, 951, 2, 3, true], ['N', 210, 951, 2, 3, true],
    ['P', 99, 1007, 1, 1], ['Q', 167, 1007, 1, 1],
    ['R', 75, 1031, 3, 1], ['S', 114, 1031, 5, 2], ['T', 191, 1031, 3, 1],
];

const pad = 10; // Body around the array.
const arrayWidth = 8 * CELL.across;
export const CAR = { width: arrayWidth + 2 * pad, length: 1160 + pad };
export const CANOPY = { cx: pad + arrayWidth / 2, cy: pad + 832, rx: 61, ry: 172 };

function cubic(from, c1, c2, to, steps = 40) {
    return Array.from({ length: steps }, (_, i) => {
        const t = (i + 1) / steps;
        const u = 1 - t;
        return [0, 1].map(k => u ** 3 * from[k] + 3 * u * u * t * c1[k] + 3 * u * t * t * c2[k] + t ** 3 * to[k]);
    });
}

function corner(cx, cy, from, radius = 18, steps = 8) {
    return Array.from({ length: steps + 1 }, (_, i) => {
        const angle = from + (Math.PI / 2) * (i / steps);
        return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
    });
}

// Outline of the body as points, clockwise from the rear left corner: straight sides, then the nose.
const middle = CAR.width / 2;
const noseStart = pad + 760;
const tip = [middle, CAR.length];
export const BODY_POINTS = [
    ...corner(18, 18, Math.PI),
    ...corner(CAR.width - 18, 18, 1.5 * Math.PI),
    [CAR.width, noseStart],
    ...cubic([CAR.width, noseStart], [CAR.width, pad + 1040], [middle + 92, pad + 1138], tip),
    ...cubic(tip, [middle - 92, pad + 1138], [0, pad + 1040], [0, noseStart]),
];
export const BODY_PATH = `M${BODY_POINTS.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')} Z`;

export const MODULE_FRAMES = [];
export const PANELS = [];
for (const [letter, left, top, rows, columns, turned = false] of MODULES) {
    const w = turned ? CELL.along : CELL.across;
    const h = turned ? CELL.across : CELL.along;
    MODULE_FRAMES.push({ id: letter, x: pad + left, y: pad + top, w: columns * w, h: rows * h });
    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            const id = `${letter}${row * columns + column + 1}`;
            PANELS.push({ id, module: letter, x: pad + left + column * w, y: pad + top + row * h, w, h });
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
