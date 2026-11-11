import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import styles from '@shared/styles/CvAuth.module.css';

export default function PartnerDashboard({ portal: p }) {
    const [approved, setApproved] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState(true);
    const [statusError, setStatusError] = useState('');
    const [statusVersion, setStatusVersion] = useState(0);
    const [query, setQuery] = useState('');
    const [teamRole, setTeamRole] = useState('');
    const [year, setYear] = useState('');
    const [filters, setFilters] = useState({
        query: '',
        teamRole: '',
        year: '',
        offset: 0,
        version: 0,
    });
    const [rows, setRows] = useState([]);
    const [loadingResults, setLoadingResults] = useState(false);
    const [resultError, setResultError] = useState('');
    const [opening, setOpening] = useState(false);
    const generation = useRef(0);

    useEffect(() => {
        let cancelled = false;
        generation.current += 1;
        setApproved(false);
        setRows([]);
        setStatusError('');
        setLoadingStatus(true);
        supabase
            .rpc('has_partner_access')
            .then(({ data, error }) => {
                if (cancelled) return;
                if (error) throw error;
                setApproved(data === true);
            })
            .catch((error) => {
                if (!cancelled) setStatusError(error.message);
            })
            .finally(() => {
                if (!cancelled) setLoadingStatus(false);
            });
        return () => {
            cancelled = true;
            generation.current += 1;
        };
    }, [p.user.id, statusVersion]);

    useEffect(() => {
        let cancelled = false;
        setRows([]);
        setResultError('');
        if (!approved) {
            setLoadingResults(false);
            return;
        }
        setLoadingResults(true);
        supabase
            .rpc('search_partner_members', {
                p_query: filters.query,
                p_team_role: filters.teamRole,
                p_graduation_year:
                    filters.year === '' ? null : Number(filters.year),
                p_offset: filters.offset,
            })
            .then(({ data, error }) => {
                if (cancelled) return;
                if (error) throw error;
                setRows(data || []);
            })
            .catch((error) => {
                if (!cancelled) setResultError(error.message);
            })
            .finally(() => {
                if (!cancelled) setLoadingResults(false);
            });
        return () => {
            cancelled = true;
        };
    }, [approved, filters, p.user.id]);

    async function openCv(path) {
        if (opening) return;
        const tab = window.open('about:blank', '_blank');
        if (!tab) {
            p.notify('Allow popups to open this PDF in a new tab.', 'error');
            return;
        }
        tab.opener = null;
        const started = generation.current;
        setOpening(true);
        try {
            const { data, error } = await supabase.storage
                .from('cvs')
                .createSignedUrl(path, 60);
            if (error) throw error;
            if (started !== generation.current) {
                tab.close();
                return;
            }
            tab.location.href = data.signedUrl;
        } catch (error) {
            tab.close();
            if (started === generation.current)
                p.notify(
                    error.message ||
                        'Unable to open this CV. Access may have changed.',
                    'error'
                );
        } finally {
            setOpening(false);
        }
    }

    if (loadingStatus)
        return (
            <p className={styles.loading} role="status">
                Checking partner access…
            </p>
        );
    if (statusError)
        return (
            <div className={styles.errorBox} role="alert">
                <p>Could not check partner access: {statusError}</p>
                <button
                    type="button"
                    onClick={() => setStatusVersion((v) => v + 1)}
                >
                    Retry
                </button>
            </div>
        );
    if (!approved)
        return (
            <section className={styles.card}>
                <h3>No active partner access</h3>
                <p className={styles.cardIntro}>Contact Nordlys for access.</p>
                <button
                    type="button"
                    className={styles.textButton}
                    onClick={() => setStatusVersion((v) => v + 1)}
                >
                    Refresh access status
                </button>
            </section>
        );
    const total = Number(rows[0]?.total_count || 0);
    return (
        <>
            <div className={styles.sectionHeading}>
                <div>
                    <h2>Member CVs</h2>
                </div>
                <button
                    type="button"
                    className={styles.textButton}
                    onClick={() => setStatusVersion((v) => v + 1)}
                >
                    Refresh access
                </button>
            </div>
            <section className={styles.card}>
                <form
                    className={styles.recruiterFilters}
                    onSubmit={(event) => {
                        event.preventDefault();
                        setFilters((previous) => ({
                            query: query.trim(),
                            teamRole: teamRole.trim(),
                            year,
                            offset: 0,
                            version: previous.version + 1,
                        }));
                    }}
                >

                    <div className={styles.field}>
                        <label htmlFor="team-role-search">Role</label>
                        <input
                            id="team-role-search"
                            maxLength={200}
                            value={teamRole}
                            onChange={(event) =>
                                setTeamRole(event.target.value)
                            }
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="year-search">Graduation year</label>
                        <input
                            id="year-search"
                            type="number"
                            min="2000"
                            max="2100"
                            step="1"
                            value={year}
                            onChange={(event) => setYear(event.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className={styles.primary}
                        disabled={loadingResults}
                    >
                        Search
                    </button>
                </form>
                {loadingResults ? (
                    <p role="status">Loading shared profiles…</p>
                ) : resultError ? (
                    <p className={styles.errorBox} role="alert">
                        {resultError}
                    </p>
                ) : rows.length === 0 ? (
                    <p className={styles.empty}>
                        No shared profiles match these filters.
                    </p>
                ) : (
                    <>
                        <p className={styles.caption}>
                            {total} matching profiles · Showing{' '}
                            {filters.offset + 1}–{filters.offset + rows.length}
                        </p>
                        <ul className={styles.fileList}>
                            {rows.map((member) => (
                                <li key={member.profile_id}>
                                    <div className={styles.fileDetails}>
                                        <strong>{member.full_name}</strong>
                                        {member.team_role && (
                                            <span>{member.team_role}</span>
                                        )}
                                        {member.study_year != null && (
                                            <span>
                                                Current Study year{' '}
                                                {member.study_year}
                                            </span>
                                        )}
                                        <span>
                                            {member.study_program ||
                                                'Study program not specified'}
                                            {member.graduation_year
                                                ? ` · Graduating ${member.graduation_year}`
                                                : ''}
                                        </span>
                                        <span>{member.original_filename}</span>
                                    </div>
                                    <div className={styles.fileActions}>
                                        <button
                                            type="button"
                                            disabled={opening}
                                            onClick={() =>
                                                openCv(member.file_path)
                                            }
                                        >
                                            View current CV ↗
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </section>
        </>
    );
}
