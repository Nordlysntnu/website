import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import CarPanels from './CarPanels';
import { BUNDLES, MAX_PANELS_PER_ORDER, NAME_MAX, PANELS, priceFor } from './adopt.mjs';
import { checkStatus, loadPanels, startCheckout } from './api';
import styles from './styles/AdoptPicker.module.css';

const kr = value => `${value.toLocaleString('nb-NO')} kr`;
const panelsLabel = count => `${count} panel${count === 1 ? '' : 's'}`;

// The smallest bigger order that costs the same or less, to suggest it.
function betterDeal(count, total) {
    for (let more = count + 1; more <= Math.min(count + 9, MAX_PANELS_PER_ORDER); more++) {
        const offer = priceFor(more);
        if (offer.total <= total) return offer;
    }
    return null;
}

export default function AdoptPicker() {
    const router = useRouter();
    const [selected, setSelected] = useState([]);
    const [taken, setTaken] = useState(new Map());
    const [service, setService] = useState('loading'); // loading | open | closed | offline
    const [name, setName] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [payment, setPayment] = useState(null); // { state: checking | paid | cancelled | failed, panels }

    const selectedSet = useMemo(() => new Set(selected), [selected]);
    const price = priceFor(selected.length);
    const deal = selected.length > 0 ? betterDeal(selected.length, price.total) : null;
    const free = PANELS.filter(panel => !taken.has(panel.id));

    async function refresh() {
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
        if (!router.isReady || typeof reference !== 'string') return;
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
        setError('');
        setSelected(current => {
            if (current.includes(id)) return current.filter(other => other !== id);
            if (current.length >= MAX_PANELS_PER_ORDER) {
                setError(`You can adopt up to ${MAX_PANELS_PER_ORDER} panels at a time.`);
                return current;
            }
            return [...current, id];
        });
    };

    // Chooses panels at random among the free ones, keeping panels already chosen.
    const pickFor = count => {
        setError('');
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
        setError('');
        setSending(true);
        try {
            const { redirectUrl } = await startCheckout({ panels: selected, name, showName: true });
            window.location.assign(redirectUrl);
        } catch (problem) {
            setError(problem.message);
            setSending(false);
            refresh();
        }
    }

    const closedText = {
        loading: 'Loading the car …',
        closed: 'Adoption opens soon. You can already look around and choose panels.',
        offline: 'The adoption service is not available right now. Please try again later.',
    }[service];

    return (
        <div className={styles.container}>
            {payment && (
                <div className={`${styles.result} ${payment.state === 'paid' ? styles.resultPaid : ''}`} role="status">
                    {payment.state === 'checking' && <p>Checking your payment with Vipps …</p>}
                    {payment.state === 'paid' && (
                        <>
                            <h3 className={styles.resultTitle}>Thank you!</h3>
                            <p>Panel{payment.panels?.length === 1 ? '' : 's'} {payment.panels?.join(', ')} {payment.panels?.length === 1 ? 'is' : 'are'} now yours. You can find {payment.panels?.length === 1 ? 'it' : 'them'} on the car below.</p>
                        </>
                    )}
                    {payment.state === 'cancelled' && <p>The payment was cancelled, so the panels are free again. Nothing was charged.</p>}
                    {payment.state === 'failed' && <p>Something went wrong with the payment. Nothing was charged. Please try again.</p>}
                    {payment.state === 'unknown' && <p>We could not confirm the payment yet. If Vipps shows it as paid, your panels will appear on the car shortly.</p>}
                    <button type="button" className={styles.link} onClick={() => setPayment(null)}>Close</button>
                </div>
            )}

            <CarPanels selected={selectedSet} taken={taken} onToggle={toggle} disabled={service === 'loading'} />

            <div className={styles.columns}>
                <section className={styles.bundles} aria-labelledby="adopt-bundles">
                    <h3 id="adopt-bundles" className={styles.heading}>Prices</h3>
                    <ul className={styles.bundleList}>
                        {BUNDLES.map(bundle => (
                            <li key={bundle.panels} className={styles.bundle}>
                                <span className={styles.bundleCount}>{panelsLabel(bundle.panels)}</span>
                                <span className={styles.bundlePrice}>{kr(bundle.price)}</span>
                                {bundle.panels > 1 && <span className={styles.bundleSave}>Save {kr(bundle.panels * BUNDLES[0].price - bundle.price)}</span>}
                                <button type="button" className={styles.pick} onClick={() => pickFor(bundle.panels)} disabled={free.length < bundle.panels}>
                                    {bundle.panels === 1 ? 'Pick one for me' : `Pick ${bundle.panels} for me`}
                                </button>
                            </li>
                        ))}
                    </ul>
                    <p className={styles.note}>Or click the panels on the car you want. Larger orders get the best combination of prices automatically.</p>
                </section>

                <section className={styles.summary} aria-labelledby="adopt-summary">
                    <h3 id="adopt-summary" className={styles.heading}>Your panels</h3>
                    {selected.length === 0 ? (
                        <p className={styles.empty}>No panels chosen yet.</p>
                    ) : (
                        <>
                            <ul className={styles.chips}>
                                {selected.map(id => (
                                    <li key={id}>
                                        <button type="button" className={styles.chip} onClick={() => toggle(id)} aria-label={`Remove panel ${id}`}>
                                            {id}<span aria-hidden="true">×</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <dl className={styles.lines}>
                                {price.parts.map(part => (
                                    <div key={part.panels} className={styles.line}>
                                        <dt>{part.times} × {panelsLabel(part.panels)}</dt>
                                        <dd>{kr(part.times * part.price)}</dd>
                                    </div>
                                ))}
                                <div className={`${styles.line} ${styles.total}`}>
                                    <dt>Total</dt>
                                    <dd>{kr(price.total)}</dd>
                                </div>
                            </dl>
                            {price.saved > 0 && <p className={styles.saved}>You save {kr(price.saved)}.</p>}
                            {deal && (
                                <p className={styles.deal}>
                                    Tip: choose {deal.count - selected.length} more for {kr(deal.total)} in total.{' '}
                                    <button type="button" className={styles.link} onClick={() => pickFor(deal.count)}>Add them</button>
                                </p>
                            )}
                            <button type="button" className={styles.link} onClick={() => setSelected([])}>Clear all</button>
                        </>
                    )}

                    <label className={styles.label} htmlFor="adopt-name">Name on your panels (optional)</label>
                    <input
                        id="adopt-name"
                        className={styles.input}
                        type="text"
                        maxLength={NAME_MAX}
                        value={name}
                        onChange={event => setName(event.target.value)}
                        placeholder="Ola Nordmann, or leave empty"
                        autoComplete="name"
                    />
                    <p className={styles.hint}>Shown when someone points at your panels. Leave it empty to adopt anonymously.</p>

                    <button
                        type="button"
                        className={styles.vipps}
                        onClick={pay}
                        disabled={selected.length === 0 || service !== 'open' || sending}
                    >
                        {sending ? 'Opening Vipps …' : selected.length > 0 ? `Pay ${kr(price.total)} with Vipps` : 'Pay with Vipps'}
                    </button>
                    <div aria-live="polite">
                        {error && <p className={styles.error}>{error}</p>}
                        {closedText && <p className={styles.hint}>{closedText}</p>}
                    </div>
                    <p className={styles.hint}>Your panels are held for you while you pay in Vipps.</p>
                </section>
            </div>
        </div>
    );
}
