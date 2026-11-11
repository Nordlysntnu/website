import styles from '@shared/styles/CvAuth.module.css';

export default function MemberDashboard({ portal: p }) {
    const profileDisabled =
        p.profileLoading ||
        Boolean(p.profileError) ||
        p.savingProfile ||
        p.cvBusy;
    const cvDisabled =
        p.cvBusy || p.cvsLoading || Boolean(p.cvsError) || p.savingProfile;
    const current = p.cvs.find((cv) => cv.is_active && !cv.deletion_pending);
    return (
        <>
            <div className={styles.dashboard}>
                <section
                    className={styles.card}
                    aria-labelledby="profile-title"
                >
                    <div className={styles.cardHeading}>
                        <div>
                            <h3 id="profile-title">Your profile</h3>
                        </div>
                    </div>
                    {p.profileLoading && (
                        <p role="status">Loading your saved profile…</p>
                    )}
                    {p.profileError && (
                        <div className={styles.errorBox} role="alert">
                            <p>Could not load your profile.</p>
                            <p>{p.profileError}</p>
                            <button type="button" onClick={p.retryProfile}>
                                Retry loading
                            </button>
                        </div>
                    )}
                    <form onSubmit={p.handleSaveProfile}>
                        <fieldset
                            className={styles.formFields}
                            disabled={profileDisabled}
                        >
                            <div className={styles.field}>
                                <label htmlFor="full-name">Full name</label>
                                <input
                                    id="full-name"
                                    autoComplete="name"
                                    required
                                    maxLength={150}
                                    value={p.fullName}
                                    onChange={(event) =>
                                        p.setFullName(event.target.value)
                                    }
                                    placeholder="Your full name"
                                />
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="team-role">Team / role</label>
                                <input
                                    id="team-role"
                                    maxLength={200}
                                    value={p.teamRole}
                                    onChange={(event) =>
                                        p.setTeamRole(event.target.value)
                                    }
                                    placeholder="e.g. Electronics — Embedded developer"
                                />
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="study-program">
                                    Study program
                                </label>
                                <input
                                    id="study-program"
                                    maxLength={200}
                                    value={p.studyProgram}
                                    onChange={(event) =>
                                        p.setStudyProgram(event.target.value)
                                    }
                                    placeholder="e.g. Computer Science"
                                />
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="study-year">Study year</label>
                                <input
                                    id="study-year"
                                    type="number"
                                    min="1"
                                    max="5"
                                    step="1"
                                    value={p.studyYear}
                                    onChange={(event) =>
                                        p.setStudyYear(event.target.value)
                                    }
                                    placeholder="e.g. 2"
                                />
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="graduation-year">
                                    Graduation year
                                </label>
                                <input
                                    id="graduation-year"
                                    type="number"
                                    min="2000"
                                    max="2100"
                                    step="1"
                                    value={p.graduationYear}
                                    onChange={(event) =>
                                        p.setGraduationYear(event.target.value)
                                    }
                                    placeholder="e.g. 2027"
                                />
                            </div>
                            <label className={styles.consent}>
                                <input
                                    type="checkbox"
                                    checked={p.visibleToRecruiters}
                                    onChange={(event) =>
                                        p.setVisibleToRecruiters(
                                            event.target.checked
                                        )
                                    }
                                />
                                <span>
                                    <strong>Share with partners</strong>
                                    <span>
                                        Share my profile and current CV with
                                        partners. Save to apply.
                                    </span>
                                </span>
                            </label>
                            <button type="submit" className={styles.primary}>
                                {p.savingProfile ? 'Saving…' : 'Save profile'}
                                <span aria-hidden="true">↗</span>
                            </button>
                        </fieldset>
                    </form>
                    <details className={styles.privacyDetails}>
                        <summary>Privacy</summary>
                        <p>
                            Only partners can see your shared profile and
                            current CV. Turn sharing off and save to hide them.
                            Downloaded copies cannot be recalled.
                        </p>
                        <p>Contact Nordlys to remove your account.</p>
                    </details>
                </section>
                <div className={styles.cvColumn}>
                    <section
                        className={styles.card}
                        aria-labelledby="upload-title"
                    >
                        <div className={styles.cardHeading}>
                            <div>
                                <h3 id="upload-title">Your CV</h3>
                                <p>
                                    {current
                                        ? `Current: ${current.original_filename}`
                                        : 'No current CV selected.'}
                                </p>
                            </div>
                        </div>
                        {!p.profileId && (
                            <p className={styles.caption}>
                                Save your member profile before uploading your
                                first CV.
                            </p>
                        )}
                        <div className={styles.uploadBox}>
                            <label htmlFor="cv-file">Choose a CV</label>
                            <p id="cv-help">PDF only · Maximum 5 MB</p>
                            <input
                                key={p.fileInputKey}
                                id="cv-file"
                                type="file"
                                accept=".pdf,application/pdf"
                                aria-describedby="cv-help"
                                disabled={cvDisabled || !p.profileId}
                                onChange={(event) =>
                                    p.setCvFile(event.target.files?.[0] ?? null)
                                }
                            />
                        </div>
                        {p.cvFile && (
                            <p className={styles.selectedFile}>
                                Ready to upload:{' '}
                                <strong>{p.cvFile.name}</strong>
                            </p>
                        )}
                        <button
                            type="button"
                            className={styles.primary}
                            onClick={p.handleUploadCv}
                            disabled={cvDisabled || !p.cvFile || !p.profileId}
                        >
                            {p.uploading ? 'Uploading…' : 'Upload CV'}
                            <span aria-hidden="true">↑</span>
                        </button>
                    </section>
                    <section
                        className={styles.card}
                        aria-labelledby="files-title"
                        aria-busy={p.cvsLoading}
                    >
                        <div className={styles.listHeading}>
                            <h3 id="files-title">Uploaded CVs</h3>
                            <button
                                type="button"
                                className={styles.textButton}
                                disabled={p.cvBusy || p.cvsLoading}
                                onClick={p.refreshCvs}
                            >
                                Refresh
                            </button>
                        </div>
                        {p.cvsError && (
                            <div className={styles.errorBox} role="alert">
                                <p>Could not load your CVs.</p>
                                <p>{p.cvsError}</p>
                                <button type="button" onClick={p.refreshCvs}>
                                    Retry loading
                                </button>
                            </div>
                        )}
                        {p.cvsLoading ? (
                            <p role="status">Loading your documents…</p>
                        ) : p.cvs.length === 0 && !p.cvsError ? (
                            <p className={styles.empty}>No CVs yet.</p>
                        ) : (
                            <ul className={styles.fileList}>
                                {p.cvs.map((cv) => (
                                    <li key={cv.id}>
                                        <span className={styles.pdfBadge}>
                                            PDF
                                        </span>
                                        <div className={styles.fileDetails}>
                                            <strong>
                                                {cv.original_filename}
                                            </strong>
                                            <span>
                                                {cv.uploaded_at
                                                    ? new Date(
                                                          cv.uploaded_at
                                                      ).toLocaleDateString(
                                                          'en-GB',
                                                          {
                                                              day: 'numeric',
                                                              month: 'short',
                                                              year: 'numeric',
                                                          }
                                                      )
                                                    : 'Uploaded document'}
                                            </span>
                                            <span
                                                className={styles.statusBadge}
                                            >
                                                {cv.deletion_pending
                                                    ? 'Deletion pending — retry below'
                                                    : cv.is_active
                                                      ? 'Current CV'
                                                      : 'Previous version'}
                                            </span>
                                        </div>
                                        <div className={styles.fileActions}>
                                            {!cv.deletion_pending && (
                                                <button
                                                    type="button"
                                                    disabled={cvDisabled}
                                                    onClick={() =>
                                                        p.handleOpenCvs(
                                                            cv.file_path
                                                        )
                                                    }
                                                >
                                                    Open ↗
                                                </button>
                                            )}
                                            {!cv.deletion_pending &&
                                                !cv.is_active && (
                                                    <button
                                                        type="button"
                                                        disabled={cvDisabled}
                                                        onClick={() =>
                                                            p.handleCurrentCv(
                                                                cv
                                                            )
                                                        }
                                                    >
                                                        Make current
                                                    </button>
                                                )}
                                            <button
                                                type="button"
                                                className={styles.deleteButton}
                                                disabled={cvDisabled}
                                                onClick={() =>
                                                    p.handleDeleteCv(cv)
                                                }
                                            >
                                                {cv.deletion_pending
                                                    ? 'Retry deletion'
                                                    : 'Delete'}
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {p.unlinkedFiles.length > 0 && (
                            <div className={styles.recoveryBox}>
                                <h4>Unlinked uploads</h4>
                                <p>
                                    Finish saving or remove these incomplete
                                    uploads.
                                </p>
                                <ul className={styles.fileList}>
                                    {p.unlinkedFiles.map((file) => (
                                        <li key={file.file_path}>
                                            <div className={styles.fileDetails}>
                                                <strong>{file.name}</strong>
                                            </div>
                                            <div className={styles.fileActions}>
                                                <button
                                                    type="button"
                                                    disabled={
                                                        cvDisabled ||
                                                        !p.profileId
                                                    }
                                                    onClick={() =>
                                                        p.handleUnlinkedFile(
                                                            file
                                                        )
                                                    }
                                                >
                                                    Finish saving
                                                </button>
                                                <button
                                                    type="button"
                                                    className={
                                                        styles.deleteButton
                                                    }
                                                    disabled={cvDisabled}
                                                    onClick={() =>
                                                        p.handleUnlinkedFile(
                                                            file,
                                                            true
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}
