import { useEffect, useState } from 'react';
import styles from './styles/ThemeToggle.module.css';

const media = '(prefers-color-scheme: dark)';

function savedTheme() {
    try {
        const value = localStorage.getItem('theme');
        return value === 'dark' || value === 'light' ? value : null;
    } catch {
        return null;
    }
}

/** Light/dark switch. Follows the system until the visitor picks one, then remembers it. */
export default function ThemeToggle() {
    const [theme, setTheme] = useState(null);

    useEffect(() => {
        setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
        const query = window.matchMedia(media);
        const follow = (event) => {
            if (savedTheme()) return;
            const next = event.matches ? 'dark' : 'light';
            document.documentElement.dataset.theme = next;
            setTheme(next);
        };
        query.addEventListener('change', follow);
        return () => query.removeEventListener('change', follow);
    }, []);

    function toggle() {
        const next = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        try { localStorage.setItem('theme', next); } catch {}
        setTheme(next);
    }

    const dark = theme === 'dark';
    return (
        <button
            type="button"
            className={styles.toggle}
            onClick={toggle}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={dark ? 'Light mode' : 'Dark mode'}
            // Hidden until mounted so the icon never shows the wrong state.
            style={theme ? undefined : { visibility: 'hidden' }}
        >
            {dark ? (
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <circle cx="12" cy="12" r="4.5" fill="currentColor" />
                    <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                    </g>
                </svg>
            ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path fill="currentColor" d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a.6.6 0 0 0-.8-.7A9.5 9.5 0 1 0 21.2 15.4a.6.6 0 0 0-.7-.8z" />
                </svg>
            )}
        </button>
    );
}
