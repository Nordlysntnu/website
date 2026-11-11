import Head from 'next/head';
import { hasMemberEmail } from '../../lib/memberPortal.mjs';
import Layout from '@shared/components/Layout';
import MemberDashboard from '@features/cv/MemberDashboard';
import AuthPanel from '@features/cv/AuthPanel';
import PartnerDashboard from '@features/cv/PartnerDashboard';
import useMemberPortal from '@features/cv/useMemberPortal';
import styles from '@shared/styles/CvAuth.module.css';

export default function CvPortal({ memberSite = false }) {
    const portal = useMemberPortal(memberSite);
    const { user, isMember, sessionLoading, message, messageType, notify } =
        portal;
    const portalView = memberSite ? 'member' : 'recruiter';
    const accountLabel = user?.email?.endsWith('@partners.nordlysntnu.invalid')
        ? user.email.split('@')[0]
        : user?.email;

    return (
        <>
            <Head>
                <title>CV portal | Nordlys</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <Layout current="CV portal">
                <></>
                <div className={styles.portal}>
                    <header className={styles.hero}>
                        <div className={styles.container}>
                            <h1>CV portal</h1>
                        </div>
                    </header>
                    <section
                        className={styles.workspace}
                        aria-label="CV portal"
                    >
                        <div className={styles.container}>
                            {sessionLoading ? (
                                <div className={styles.loading} role="status">
                                    Loading your portal…
                                </div>
                            ) : portal.recovering && user ? (
                                <AuthPanel portal={portal} />
                            ) : user ? (
                                <>
                                    <div className={styles.toolbar}>
                                        <div className={styles.tabs}>
                                            <button
                                                type="button"
                                                className={styles.activeTab}
                                                aria-current="page"
                                            >
                                                {isMember
                                                    ? 'Member portal'
                                                    : 'Partner portal'}
                                            </button>
                                        </div>
                                        <div className={styles.account}>
                                            <span title={accountLabel}>
                                                {accountLabel}
                                            </span>
                                            <button
                                                type="button"
                                                className={styles.textButton}
                                                disabled={
                                                    portal.cvBusy ||
                                                    portal.savingProfile ||
                                                    portal.authBusy
                                                }
                                                onClick={portal.handleLogout}
                                            >
                                                Log out ↗
                                            </button>
                                        </div>
                                    </div>
                                    {message && message !== 'Welcome back.' && (
                                        <p
                                            className={`${styles.notice} ${messageType === 'error' ? styles.errorNotice : ''}`}
                                            role={
                                                messageType === 'error'
                                                    ? 'alert'
                                                    : 'status'
                                            }
                                        >
                                            {message}
                                        </p>
                                    )}
                                    {portalView === 'member' ? (
                                        isMember ? (
                                            <MemberDashboard portal={portal} />
                                        ) : (
                                            <section className={styles.card}>
                                                <h2>
                                                    Member access unavailable
                                                </h2>
                                                <p>
                                                    You are signed in as{' '}
                                                    <strong>
                                                        {user.email}
                                                    </strong>
                                                    .
                                                </p>
                                                <p>
                                                    {hasMemberEmail(user.email)
                                                        ? 'Confirm your Nordlys email to continue.'
                                                        : 'Log out and sign in with your @nordlysntnu.no email.'}
                                                </p>
                                                {hasMemberEmail(user.email) &&
                                                    !user.email_confirmed_at && (
                                                        <button
                                                            type="button"
                                                            className={
                                                                styles.textButton
                                                            }
                                                            disabled={
                                                                portal.authBusy
                                                            }
                                                            onClick={
                                                                portal.resendConfirmation
                                                            }
                                                        >
                                                            Resend confirmation
                                                            email
                                                        </button>
                                                    )}
                                            </section>
                                        )
                                    ) : (
                                        <PartnerDashboard portal={portal} />
                                    )}
                                </>
                            ) : (
                                <AuthPanel portal={portal} />
                            )}
                        </div>
                    </section>
                </div>
            </Layout>
        </>
    );
}
