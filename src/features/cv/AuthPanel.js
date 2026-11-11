import styles from '@shared/styles/CvAuth.module.css';

export default function AuthPanel({ portal: p }) {
    const isRegister = p.authMode.startsWith('register');
    const isReset = p.authMode === 'reset';
    const isPartner = p.authMode === 'partner-login';
    function changeMode(mode) {
        p.setAuthMode(mode);
        p.setPassword('');
        p.setConfirmPassword('');
        p.notify('');
    }
    return (
        <div className={styles.loginGrid}>
            <section className={styles.card} aria-labelledby="login-title">
                <h3 id="login-title">
                    {p.recovering
                        ? 'Set a new password'
                        : isReset
                          ? 'Reset your password'
                          : isRegister
                            ? 'Create your account'
                            : p.memberSite
                              ? 'Member login'
                              : 'Partner login'}
                </h3>
                {p.message && (
                    <p
                        className={`${styles.notice} ${p.messageType === 'error' ? styles.errorNotice : ''}`}
                        role={p.messageType === 'error' ? 'alert' : 'status'}
                    >
                        {p.message}
                    </p>
                )}
                {p.recovering && p.user ? (
                    <form onSubmit={p.updatePassword}>
                        <div className={styles.field}>
                            <label htmlFor="new-password">New password</label>
                            <input
                                id="new-password"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={6}
                                value={p.password}
                                onChange={(event) =>
                                    p.setPassword(event.target.value)
                                }
                                disabled={p.authBusy}
                            />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="confirm-password">
                                Confirm new password
                            </label>
                            <input
                                id="confirm-password"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={6}
                                value={p.confirmPassword}
                                onChange={(event) =>
                                    p.setConfirmPassword(event.target.value)
                                }
                                disabled={p.authBusy}
                            />
                        </div>
                        <p className={styles.caption}>
                            Use at least 6 characters.
                        </p>
                        <button
                            type="submit"
                            className={styles.primary}
                            disabled={p.authBusy}
                        >
                            {p.authBusy ? 'Updating…' : 'Update password'}
                        </button>
                        <button
                            type="button"
                            className={styles.textButton}
                            onClick={() => {
                                p.setPassword('');
                                p.setConfirmPassword('');
                                p.setRecovering(false);
                                window.history.replaceState(
                                    null,
                                    '',
                                    p.portalPath
                                );
                            }}
                        >
                            Cancel
                        </button>
                    </form>
                ) : (
                    <>
                        {(isReset || isRegister) && (
                            <p className={styles.cardIntro}>
                                {isReset
                                    ? 'Receive a password reset link by email.'
                                    : 'Use your @nordlysntnu.no email.'}
                            </p>
                        )}
                        <form onSubmit={p.handleAuth}>
                            <div className={styles.field}>
                                <label htmlFor="email">
                                    {isPartner ? 'Username' : 'Email address'}
                                </label>
                                <input
                                    id="email"
                                    type={isPartner ? 'text' : 'email'}
                                    autoComplete={
                                        isPartner ? 'username' : 'email'
                                    }
                                    required
                                    value={p.email}
                                    onChange={(event) =>
                                        p.setEmail(event.target.value)
                                    }
                                    placeholder={
                                        isPartner
                                            ? 'Partner username'
                                            : p.authMode === 'register-member'
                                              ? 'you@nordlysntnu.no'
                                              : 'you@example.com'
                                    }
                                    disabled={p.authBusy}
                                />
                            </div>
                            {!isReset && (
                                <div className={styles.field}>
                                    <label htmlFor="password">Password</label>
                                    <input
                                        id="password"
                                        type="password"
                                        autoComplete={
                                            isRegister
                                                ? 'new-password'
                                                : 'current-password'
                                        }
                                        minLength={isRegister ? 6 : undefined}
                                        required
                                        value={p.password}
                                        onChange={(event) =>
                                            p.setPassword(event.target.value)
                                        }
                                        placeholder={
                                            isRegister
                                                ? 'At least 6 characters'
                                                : 'Your password'
                                        }
                                        disabled={p.authBusy}
                                    />
                                </div>
                            )}
                            <button
                                type="submit"
                                className={styles.primary}
                                disabled={p.authBusy}
                            >
                                {p.authBusy
                                    ? 'Please wait…'
                                    : isReset
                                      ? 'Send reset link'
                                      : isRegister
                                        ? 'Create account'
                                        : 'Log in'}
                                <span aria-hidden="true">↗</span>
                            </button>
                        </form>
                        {!isPartner && (
                            <div className={styles.registerRow}>
                                <button
                                    type="button"
                                    className={styles.textButton}
                                    disabled={p.authBusy}
                                    onClick={() =>
                                        changeMode(
                                            isRegister || isReset
                                                ? 'login'
                                                : 'register-member'
                                        )
                                    }
                                >
                                    {isRegister || isReset
                                        ? 'Back to login'
                                        : 'Create a member account ↗'}
                                </button>
                                {!isRegister && !isReset && !isPartner && (
                                    <button
                                        type="button"
                                        className={styles.textButton}
                                        disabled={p.authBusy}
                                        onClick={() => changeMode('reset')}
                                    >
                                        Forgot password?
                                    </button>
                                )}
                            </div>
                        )}
                        {isRegister && (
                            <button
                                type="button"
                                className={styles.textButton}
                                disabled={p.authBusy || !p.email.trim()}
                                onClick={p.resendConfirmation}
                            >
                                Resend confirmation email
                            </button>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}
