// Moving between panels on the car with the arrow keys.
import { CAR, PANELS } from './adopt.mjs';

export const DIRECTIONS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

// Where a panel's centre is on screen. On wide screens the car lies on its side with the nose to the right.
function centre(panel, upright) {
    const x = panel.x + panel.w / 2;
    const y = panel.y + panel.h / 2;
    return upright ? [x, y] : [y, CAR.width - x];
}

// The nearest panel in the direction of an arrow key, preferring panels straight ahead.
export function neighbour(panel, key, upright) {
    const [dx, dy] = DIRECTIONS[key];
    const [x, y] = centre(panel, upright);
    let best = panel;
    let bestScore = Infinity;
    for (const other of PANELS) {
        const [ox, oy] = centre(other, upright);
        const ahead = (ox - x) * dx + (oy - y) * dy;
        if (ahead < 1) continue;
        const score = ahead + 3 * Math.abs((ox - x) * dy - (oy - y) * dx);
        if (score < bestScore) {
            best = other;
            bestScore = score;
        }
    }
    return best;
}
