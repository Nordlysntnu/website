import { useEffect, useMemo, useState } from 'react';
import { BODY_PATH, CANOPY, CAR, PANELS } from './adopt.mjs';
import styles from './styles/CarPanels.module.css';

const byPosition = new Map(PANELS.map(panel => [`${panel.row}:${panel.col}`, panel]));

// The nearest panel in a direction, for moving with the arrow keys.
function neighbour(panel, key) {
    if (key === 'ArrowLeft' || key === 'ArrowRight') {
        const step = key === 'ArrowLeft' ? -1 : 1;
        for (let col = panel.col + step; col >= 0 && col < 40; col += step) {
            const next = byPosition.get(`${panel.row}:${col}`);
            if (next) return next;
        }
        return panel;
    }
    const row = panel.row + (key === 'ArrowUp' ? -1 : 1);
    const candidates = PANELS.filter(other => other.row === row);
    if (candidates.length === 0) return panel;
    return candidates.reduce((best, other) => Math.abs(other.col - panel.col) < Math.abs(best.col - panel.col) ? other : best);
}

export function describePanel(panel, selected, taken) {
    const owner = taken.get(panel.id);
    if (owner?.held) return `Panel ${panel.id} · someone is paying for it right now`;
    if (owner) return owner.name ? `Panel ${panel.id} · adopted by ${owner.name}` : `Panel ${panel.id} · adopted`;
    return selected.has(panel.id) ? `Panel ${panel.id} · your choice` : `Panel ${panel.id} · available`;
}

export default function CarPanels({ selected, taken, onToggle, disabled }) {
    const [focusId, setFocusId] = useState(PANELS[0].id);
    const [infoId, setInfoId] = useState(null);
    const info = useMemo(() => PANELS.find(panel => panel.id === infoId), [infoId]);
    // On narrow screens the car stands upright so the panels are big enough to tap.
    const [upright, setUpright] = useState(false);
    useEffect(() => {
        const query = window.matchMedia('(max-width: 600px)');
        const update = () => setUpright(query.matches);
        update();
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);

    function handleKey(event, panel) {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
            event.preventDefault();
            // Upright, the car is turned 90 degrees, so the arrows turn with it.
            const turned = { ArrowDown: 'ArrowRight', ArrowUp: 'ArrowLeft', ArrowRight: 'ArrowUp', ArrowLeft: 'ArrowDown' };
            const next = neighbour(panel, upright ? turned[event.key] : event.key);
            setFocusId(next.id);
            setInfoId(next.id);
            event.currentTarget.ownerSVGElement.querySelector(`[data-panel="${next.id}"]`)?.focus();
        } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (!taken.has(panel.id) && !disabled) onToggle(panel.id);
        }
    }

    return (
        <figure className={styles.figure}>
            <svg
                className={styles.car}
                viewBox={upright ? `0 0 ${CAR.height} ${CAR.width}` : `0 0 ${CAR.width} ${CAR.height}`}
                role="group"
                aria-label="Solar panels on the car. Use the arrow keys to move and Enter to choose."
            >
                <defs>
                    <linearGradient id="adopt-cell" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#2a3d70" />
                        <stop offset="1" stopColor="#16244a" />
                    </linearGradient>
                    <linearGradient id="adopt-canopy" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#5d6f99" />
                        <stop offset="1" stopColor="#1f2d52" />
                    </linearGradient>
                </defs>
                <g transform={upright ? `translate(${CAR.height} 0) rotate(90)` : undefined}>
                <path className={styles.body} d={BODY_PATH} />
                <ellipse className={styles.canopy} cx={CANOPY.cx} cy={CANOPY.cy} rx={CANOPY.rx} ry={CANOPY.ry} fill="url(#adopt-canopy)" />
                <ellipse className={styles.shine} cx={CANOPY.cx - 22} cy={CANOPY.cy - 20} rx={CANOPY.rx * 0.45} ry={CANOPY.ry * 0.28} />
                {PANELS.map(panel => {
                    const owner = taken.get(panel.id);
                    const chosen = selected.has(panel.id);
                    const state = owner ? (owner.held ? styles.held : styles.adopted) : chosen ? styles.chosen : styles.free;
                    return (
                        <rect
                            key={panel.id}
                            data-panel={panel.id}
                            className={`${styles.panel} ${state}`}
                            x={panel.x}
                            y={panel.y}
                            width={panel.size}
                            height={panel.size}
                            rx="4"
                            role="checkbox"
                            aria-checked={chosen}
                            aria-disabled={!!owner || disabled}
                            aria-label={describePanel(panel, selected, taken)}
                            tabIndex={panel.id === focusId ? 0 : -1}
                            onClick={() => { setFocusId(panel.id); if (!owner && !disabled) onToggle(panel.id); }}
                            onKeyDown={event => handleKey(event, panel)}
                            onFocus={() => setInfoId(panel.id)}
                            onMouseEnter={() => setInfoId(panel.id)}
                            onMouseLeave={() => setInfoId(null)}
                        />
                    );
                })}
                </g>
            </svg>
            <figcaption className={styles.caption}>
                <ul className={styles.legend}>
                    <li><span className={`${styles.swatch} ${styles.free}`} />Available</li>
                    <li><span className={`${styles.swatch} ${styles.chosen}`} />Your choice</li>
                    <li><span className={`${styles.swatch} ${styles.adopted}`} />Adopted</li>
                </ul>
                <p className={styles.info} aria-live="polite">
                    {info ? describePanel(info, selected, taken) : 'Point at a panel to see who adopted it.'}
                </p>
            </figcaption>
        </figure>
    );
}
