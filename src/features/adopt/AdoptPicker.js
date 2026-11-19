import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import CarPanels from './CarPanels';
import { BUNDLES, EMAIL_MAX, MAX_PANELS_PER_ORDER, NAME_MAX, PANELS, cleanEmail, priceFor } from './adopt.mjs';
import { PREVIEW, checkStatus, loadPanels, startCheckout } from './api';
import { TEXT } from './text.mjs';
import styles from './styles/AdoptPicker.module.css';

// The smallest bigger order that costs the same or less, to suggest it.
function betterDeal(count, total) {
    for (let more = count + 1; more <= Math.min(count + 9, MAX_PANELS_PER_ORDER); more++) {
        const offer = priceFor(more);
        if (offer.total <= total) return offer;
    }
    return null;
}

export default function AdoptPicker({ text = TEXT.en }) {
    const t = text.picker;
    const router = useRouter();
    const [selected, setSelected] = useState([]);
    const [taken, setTaken] = useState(new Map());
    const [service, setService] = useState('loading'); // loading | open | closed | offline | preview
    const [notice, setNotice] = useState(''); // key: previewNotice
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);
    // Messages are kept as keys, so they follow the language switch.
    const [error, setError] = useState(null); // { key, status? }
    const [payment, setPayment] = useState(null); // { state: checking | paid | cancelled | failed | unknown, panels }

    const selectedSet = useMemo(() => new Set(selected), [selected]);
    const price = priceFor(selected.length);
    const deal = selected.length > 0 ? betterDeal(selected.length, price.total) : null;
    const free = PANELS.filter(panel => !taken.has(panel.id));

    async function refresh() {
        if (PREVIEW) { setService('preview'); return; }
        try {
            const data = await loadPanels();
            setTaken(new Map(data.taken.map(panel => [panel.id, panel])));
            setSelected(current => current.filter(id => !data.taken.some(panel => panel.id === id)));
            setService(data.open ? 'open' : 'closed');
        } catch {
            setService('offline');
        }
    }

    useEffect(() => { refresh(); }, []);

    // Back from Vipps: check the payment until it is settled.
    useEffect(() => {
        const reference = router.query.reference;
        if (PREVIEW || !router.isReady || typeof reference !== 'string') return;
        let stopped = false;
        setPayment({ state: 'checking' });
        (async () => {
            for (let attempt = 0; attempt < 30 && !stopped; attempt++) {
                try {
                    const result = await checkStatus(reference);
                    if (result.status !== 'pending') {
                        setPayment({ state: result.status, panels: result.panels });
                        refresh();
                        return;
                    }
                } catch {
                    // Keep trying; the network may be slow right after the redirect.
                }
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            if (!stopped) setPayment({ state: 'unknown' });
        })();
        router.replace('/adopt', undefined, { shallow: true, scroll: false });
        return () => { stopped = true; };
    }, [router.isReady]);

    const toggle = id => {
        setError(null);
        setNotice('');
        setSelected(current => {
            if (current.includes(id)) return current.filter(other => other !== id);
            if (current.length >= MAX_PANELS_PER_ORDER) {
                setError({ key: 'maxPanels' });
                return current;
            }
            return [...current, id];
        });
    };

    // Chooses panels at random among the free ones, keeping panels already chosen.
    const pickFor = count => {
        setError(null);
        const remaining = free.filter(panel => !selectedSet.has(panel.id)).map(panel => panel.id);
        const kept = selected.slice(0, count);
        const needed = Math.max(0, count - kept.length);
        for (let i = remaining.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
        }
        setSelected([...kept, ...remaining.slice(0, needed)]);
    };

    async function pay() {
        setError(null);
        setNotice('');
        const buyerEmail = cleanEmail(email);
        if (buyerEmail === null) {
            setError({ key: 'badEmail' });
            return;
        }
        if (PREVIEW) {
            setNotice('previewNotice');
            return;
        }
        setSending(true);
        try {
            const { redirectUrl } = await startCheckout({ panels: selected, name, showName: true, email: buyerEmail });
            window.location.assign(redirectUrl);
        } catch (problem) {
            setError({ key: 'request', status: problem.status });
            setSending(false);
            refresh();
        }
    }

    const errorText = !error ? ''
        : error.key === 'maxPanels' ? t.maxPanels(MAX_PANELS_PER_ORDER)
        : error.key === 'request' ? t.errors[error.status] ?? t.status.offline
        : t[error.key];
    const statusText = service === 'open' ? '' : t.status[service];

    return (
        <div className={styles.container}>
            {payment && (
                <div className={`${styles.result} ${payment.state === 'paid' ? styles.resultPaid : ''}`} role="status">
                    {payment.state === 'checking' && <p>{t.checking}</p>}
                    {payment.state === 'paid' && (
                        <>
                            <h3 className={styles.resultTitle}>{t.thanks}</h3>
                            <p>{t.paid(payment.panels)}</p>
                        </>
                    )}
                    {['cancelled', 'failed', 'unknown'].includes(payment.state) && <p>{t[payment.state]}</p>}
                    <button type="button" className={styles.link} onClick={() => setPayment(null)}>{t.close}</button>
                </div>
            )}

            <CarPanels selected={selectedSet} taken={taken} onToggle={toggle} disabled={service === 'loading'} text={text.car} />

            <div className={styles.columns}>
                <section className={styles.bundles} aria-labelledby="adopt-bundles">
                    <h3 id="adopt-bundles" className={styles.heading}>{t.prices}</h3>
                    <ul className={styles.bundleList}>
                        {BUNDLES.map(bundle => (
                            <li key={bundle.panels} className={styles.bundle}>
                                <span className={styles.bundleCount}>{t.panels(bundle.panels)}</span>
                                <span className={styles.bundlePrice}>{t.kr(bundle.price)}</span>
                                {bundle.panels > 1 && <span className={styles.bundleSave}>{t.save(bundle.panels * BUNDLES[0].price - bundle.price)}</span>}
                                <button type="button" className={styles.pick} onClick={() => pickFor(bundle.panels)} disabled={free.length < bundle.panels}>
                                    {t.pick(bundle.panels)}
                                </button>
                            </li>
                        ))}
                    </ul>
                    <p className={styles.note}>{t.note}</p>
                </section>

                <section className={styles.summary} aria-labelledby="adopt-summary">
                    <h3 id="adopt-summary" className={styles.heading}>{t.yourPanels}</h3>
                    {selected.length === 0 ? (
                        <p className={styles.empty}>{t.none}</p>
                    ) : (
                        <>
                            <ul className={styles.chips}>
                                {selected.map(id => (
                                    <li key={id}>
                                        <button type="button" className={styles.chip} onClick={() => toggle(id)} aria-label={t.remove(id)}>
                                            {id}<span aria-hidden="true">×</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <dl className={styles.lines}>
                                {price.parts.map(part => (
                                    <div key={part.panels} className={styles.line}>
                                        <dt>{part.times} × {t.panels(part.panels)}</dt>
                                        <dd>{t.kr(part.times * part.price)}</dd>
                                    </div>
                                ))}
                                <div className={`${styles.line} ${styles.total}`}>
                                    <dt>{t.total}</dt>
                                    <dd>{t.kr(price.total)}</dd>
                                </div>
                            </dl>
                            {price.saved > 0 && <p className={styles.saved}>{t.saved(price.saved)}</p>}
                            {deal && (
                                <p className={styles.deal}>
                                    {t.tip(deal.count - selected.length, deal.total)}{' '}
                                    <button type="button" className={styles.link} onClick={() => pickFor(deal.count)}>{t.addThem}</button>
                                </p>
                            )}
                            <button type="button" className={styles.link} onClick={() => setSelected([])}>{t.clearAll}</button>
                        </>
                    )}

                    <label className={styles.label} htmlFor="adopt-name">{t.nameLabel}</label>
                    <input
                        id="adopt-name"
                        className={styles.input}
                        type="text"
                        maxLength={NAME_MAX}
                        value={name}
                        onChange={event => setName(event.target.value)}
                        placeholder={t.namePlaceholder}
                        autoComplete="name"
                    />
                    <p className={styles.hint}>{t.nameHint}</p>

                    <label className={styles.label} htmlFor="adopt-email">{t.emailLabel}</label>
                    <input
                        id="adopt-email"
                        className={styles.input}
                        type="email"
                        maxLength={EMAIL_MAX}
                        value={email}
                        onChange={event => { setEmail(event.target.value); setError(null); }}
                        placeholder={t.emailPlaceholder}
                        autoComplete="email"
                    />
                    <p className={styles.hint}>{t.emailHint}</p>

                    <button
                        type="button"
                        className={styles.vipps}
                        onClick={pay}
                        disabled={selected.length === 0 || !['open', 'preview'].includes(service) || sending}
                    >
                        {sending ? t.opening : selected.length > 0 ? t.payAmount(price.total) : t.pay}
                    </button>
                    <div aria-live="polite">
                        {errorText && <p className={styles.error}>{errorText}</p>}
                        {notice && <p className={styles.notice}>{t[notice]}</p>}
                        {statusText && !notice && <p className={styles.hint}>{statusText}</p>}
                    </div>
                    {!PREVIEW && <p className={styles.hint}>{t.held}</p>}
                    <p className={styles.hint}>
                        {t.terms[0]}<Link href="/terms" className={styles.inlineLink}>{t.terms[1]}</Link>{t.terms[2]}
                    </p>
                </section>
            </div>
        </div>
    );
}
