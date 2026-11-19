import { useEffect, useState } from 'react';
import { LANGUAGES, pickLanguage } from './text.mjs';

const STORAGE_KEY = 'nordlys-adopt-language';

// The page is built in English. After loading it switches to Norwegian for Norwegian browsers,
// or to the language the visitor chose last time with the switch.
export default function useAdoptLanguage() {
    const [language, setLanguage] = useState('en');

    useEffect(() => {
        let saved = null;
        try { saved = localStorage.getItem(STORAGE_KEY); } catch {}
        setLanguage(LANGUAGES.includes(saved) ? saved : pickLanguage(navigator.languages?.length ? navigator.languages : [navigator.language]));
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        const before = root.lang;
        root.lang = language;
        return () => { root.lang = before || 'en'; };
    }, [language]);

    const choose = next => {
        setLanguage(next);
        try { localStorage.setItem(STORAGE_KEY, next); } catch {}
    };

    return [language, choose];
}
