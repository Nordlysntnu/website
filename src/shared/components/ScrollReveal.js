import { useEffect, useRef, useState } from 'react';
import { observeReveal } from '@shared/lib/observeReveal.mjs';
import 'animate.css/animate.min.css';

// Each reveal runs once. CSS owns the delay, so navigation leaves no timers behind.
export default function ScrollReveal({ children, animateIn, offset = 150, duration = 1, delay = 0 }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => observeReveal(ref.current, () => setVisible(true), offset), [offset]);

    return (
        <div
            ref={ref}
            className={visible ? `animate__animated ${animateIn}` : undefined}
            style={{ animationDuration: `${duration}s`, animationDelay: `${delay}ms`, opacity: visible ? 1 : 0 }}
        >
            {children}
        </div>
    );
}
