import { useRef, useState } from 'react';
import ThemedIcon from '@features/ui/ThemedIcon';
import { MAX_CHOICES, ordinal } from './choices';
import styles from './styles/JoinForm.module.css';

// Apps Script web app that adds each application to the Board-only sheet.
// Setup and script: docs/join-applications.
export const APPLICATION_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxSqToQlCxCciod-4KXk-pdR2KeIKYr1Eq1NgQVLyrsktXrVQ1SKJkqCpBizrXsCmLEqw/exec';

const YEARS = ['1st year', '2nd year', '3rd year', '4th year', '5th year', 'PhD or other'];
const SOURCES = ['Stand on campus', 'Posters', 'Social media', 'Friends', 'A lecture', 'Other'];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?\d{8,15}$/;

function validate(values, choices, consent) {
    const errors = {};
    if (!values.first) errors.first = 'First name is required';
    if (!values.last) errors.last = 'Last name is required';
    if (!values.email) errors.email = 'Email is required';
    else if (!emailPattern.test(values.email)) errors.email = 'Please enter a valid email address';
    if (!values.phone) errors.phone = 'Phone number is required';
    else if (!phonePattern.test(values.phone.replace(/[\s-]/g, ''))) errors.phone = 'Please enter a valid phone number';
    if (!values.study) errors.study = 'Field of study is required';
    if (choices.length === 0) errors.groups = 'Choose at least one group';
    if (!values.about) errors.about = 'Please tell us a little about yourself';
    if (!consent) errors.consent = 'We need your consent to process the application';
    return errors;
}

export default function JoinForm({ groups, choices, onToggle, onReset }) {
    const formRef = useRef(null);
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('idle');
    const [thesis, setThesis] = useState(false);
    const [source, setSource] = useState('');
    const [consent, setConsent] = useState(false);
    const [firstName, setFirstName] = useState('');

    const full = choices.length >= MAX_CHOICES;

    const fieldProps = name => ({
        id: `join-${name}`,
        name,
        'aria-invalid': errors[name] ? true : undefined,
        'aria-describedby': errors[name] ? `join-${name}-error` : undefined,
    });
    const errorFor = name => errors[name] && <p id={`join-${name}-error`} className={styles.errorText}>{errors[name]}</p>;

    function handleSubmit(event) {
        event.preventDefault();
        const form = formRef.current;
        const read = name => (form.elements[name]?.value ?? '').trim();
        const values = {
            first: read('first'), last: read('last'), email: read('email'), phone: read('phone'),
            study: read('study'), year: read('year'), about: read('about'),
        };

        const nextErrors = validate(values, choices, consent);
        setErrors(nextErrors);
        const firstInvalid = Object.keys(nextErrors)[0];
        if (firstInvalid) {
            setStatus('invalid');
            const target = firstInvalid === 'groups' ? form.querySelector('[data-group-picker] button') : form.elements[firstInvalid];
            target?.focus();
            return;
        }

        const idea = read('thesisIdea');
        const other = read('sourceOther');
        const data = {
            ...values,
            group1: groups[choices[0]]?.name ?? '',
            group2: groups[choices[1]]?.name ?? '',
            group3: groups[choices[2]]?.name ?? '',
            thesis: thesis ? (idea ? `Yes: ${idea}` : 'Yes') : 'No',
            source: source === 'Other' && other ? `Other: ${other}` : source,
            website: read('website'),
        };

        if (process.env.NEXT_PUBLIC_LOCAL_PREVIEW === 'true') {
            setStatus('local');
            return;
        }

        const body = new FormData();
        Object.entries(data).forEach(([key, value]) => body.append(key, value));

        setStatus('sending');
        fetch(APPLICATION_ENDPOINT, { method: 'POST', body })
            .then(response => response.json())
            .then(result => {
                if (result?.result !== 'success') throw new Error('Application was not saved');
                setFirstName(values.first);
                form.reset();
                setThesis(false);
                setSource('');
                setConsent(false);
                onReset();
                setStatus('success');
            })
            .catch(() => setStatus('error'));
    }

    if (status === 'success') {
        return (
            <div className={styles.done} role="status">
                <span className={styles.doneIcon} aria-hidden="true">&#10003;</span>
                <h3 className={styles.doneTitle}>Thanks, {firstName}!</h3>
                <p>Your application has been sent. We will contact you by email with more information.</p>
                <button type="button" className={styles.secondary} onClick={() => setStatus('idle')}>Send another application</button>
            </div>
        );
    }

    return (
        <form className={styles.form} ref={formRef} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
                <label className={styles.labelRequired} htmlFor="join-first">First name</label>
                <input className={styles.input} type="text" placeholder="Ola" autoComplete="given-name" {...fieldProps('first')} />
                {errorFor('first')}
            </div>
            <div className={styles.field}>
                <label className={styles.labelRequired} htmlFor="join-last">Last name</label>
                <input className={styles.input} type="text" placeholder="Nordmann" autoComplete="family-name" {...fieldProps('last')} />
                {errorFor('last')}
            </div>
            <div className={styles.field}>
                <label className={styles.labelRequired} htmlFor="join-email">Email</label>
                <input className={styles.input} type="email" placeholder="ola.nordmann@example.com" autoComplete="email" {...fieldProps('email')} />
                {errorFor('email')}
            </div>
            <div className={styles.field}>
                <label className={styles.labelRequired} htmlFor="join-phone">Phone</label>
                <input className={styles.input} type="tel" placeholder="+47 123 45 678" autoComplete="tel" {...fieldProps('phone')} />
                {errorFor('phone')}
            </div>
            <div className={styles.field}>
                <label className={styles.labelRequired} htmlFor="join-study">Field of study</label>
                <input className={styles.input} type="text" placeholder="Mechanical Engineering" {...fieldProps('study')} />
                {errorFor('study')}
            </div>
            <div className={styles.field}>
                <label className={styles.label} htmlFor="join-year">Year</label>
                <select className={styles.input} id="join-year" name="year" defaultValue={YEARS[0]}>
                    {YEARS.map(year => <option key={year}>{year}</option>)}
                </select>
            </div>

            <fieldset className={`${styles.wide} ${styles.fieldset}`} aria-describedby={errors.groups ? 'join-groups-error' : 'join-groups-hint'}>
                <legend className={styles.labelRequired}>Groups</legend>
                <p id="join-groups-hint" className={styles.hint}>Choose up to {MAX_CHOICES}, in order of preference.</p>
                <div className={styles.picker} data-group-picker>
                    {Object.entries(groups).map(([key, group]) => {
                        const rank = choices.indexOf(key);
                        return (
                            <button
                                key={key}
                                type="button"
                                className={styles.pill}
                                aria-pressed={rank >= 0}
                                disabled={rank < 0 && full}
                                onClick={() => onToggle(key)}
                            >
                                <ThemedIcon className={styles.pillIcon} width={22} height={22} light={group.image?.light ?? group.image} dark={group.image?.dark} />
                                {group.name}
                                {rank >= 0 && <span className={styles.rank} aria-hidden="true">{rank + 1}</span>}
                            </button>
                        );
                    })}
                </div>
                <p className={styles.summary} aria-live="polite">
                    {choices.length > 0 && choices.map((key, index) => `${ordinal(index)}: ${groups[key]?.name}`).join(' · ')}
                </p>
                {errorFor('groups')}
            </fieldset>

            <div className={`${styles.field} ${styles.wide}`}>
                <label className={styles.labelRequired} htmlFor="join-about">Why do you want to join Nordlys?</label>
                <p className={styles.hint}>What interests you, what you would like to learn and any experience you want to mention.</p>
                <textarea className={`${styles.input} ${styles.textarea}`} placeholder="Tell us about yourself" {...fieldProps('about')} />
                {errorFor('about')}
            </div>

            <div className={`${styles.field} ${styles.wide}`}>
                <label className={styles.check}>
                    <input type="checkbox" checked={thesis} onChange={event => setThesis(event.target.checked)} />
                    <span>I would like to write my bachelor&apos;s or master&apos;s thesis with Nordlys</span>
                </label>
                {thesis && (
                    <div className={styles.indent}>
                        <label className={styles.label} htmlFor="join-thesisIdea">Your thesis idea (optional)</label>
                        <textarea className={`${styles.input} ${styles.textareaSmall}`} id="join-thesisIdea" name="thesisIdea" placeholder="Describe your idea" />
                        <p className={styles.hint}>You must also apply for your thesis through NTNU.</p>
                    </div>
                )}
            </div>

            <div className={styles.field}>
                <label className={styles.label} htmlFor="join-source">Where did you hear about us?</label>
                <select className={styles.input} id="join-source" name="source" value={source} onChange={event => setSource(event.target.value)}>
                    <option value="">Choose one</option>
                    {SOURCES.map(option => <option key={option}>{option}</option>)}
                </select>
            </div>
            {source === 'Other' && (
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="join-sourceOther">Where?</label>
                    <input className={styles.input} type="text" id="join-sourceOther" name="sourceOther" />
                </div>
            )}

            <div className={`${styles.field} ${styles.wide}`}>
                <label className={styles.check}>
                    <input
                        type="checkbox"
                        name="consent"
                        checked={consent}
                        onChange={event => setConsent(event.target.checked)}
                        aria-invalid={errors.consent ? true : undefined}
                        aria-describedby={errors.consent ? 'join-consent-error' : undefined}
                    />
                    <span className={styles.required}>
                        I agree that Nordlys stores my application until it has been processed, and no longer than six months.
                    </span>
                </label>
                {errorFor('consent')}
            </div>

            <div className={styles.trap} aria-hidden="true">
                <label htmlFor="join-website">Website</label>
                <input type="text" id="join-website" name="website" tabIndex={-1} autoComplete="off" />
            </div>

            <div className={`${styles.actions} ${styles.wide}`}>
                <button className={styles.submit} disabled={status === 'sending'}>
                    {status === 'sending' ? 'Sending…' : 'Send application'}
                </button>
                <div role="status" aria-live="polite">
                    {status === 'invalid' && <p className={styles.errorText}>Please check the fields marked in red.</p>}
                    {status === 'error' && <p className={styles.error}><span aria-hidden="true">!</span> Something went wrong. Please try again later, or use the contact form below.</p>}
                    {status === 'local' && <p className={styles.note}>Local test complete — nothing was sent.</p>}
                </div>
            </div>
        </form>
    );
}
