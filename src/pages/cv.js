import { supabase } from "../../lib/supabaseClient";
import { useEffect, useState } from "react";
import Head from "next/head";
import Layout from "@shared/components/Layout";
import styles from "@shared/styles/CvAuth.module.css";


export default function CvPortal() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")
    const [user, setUser] = useState(null)
    const [fullName, setFullName] = useState("");
    const [studyProgram, setStudyProgram] = useState("");
    const [graduationYear, setGraduationYear] = useState("");
    const [cvFile, setCvFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [cvs, setCvs] = useState([])
    const [cvListVersion, setCvListVersion] = useState(0);
    const [deletingId, setDeletingId] = useState(null);
    const [visibleToRecruiters, setVisibleToRecruiters] = useState(false);
    const [portalView, setPortalView] = useState("member");
    const [companyName, setCompanyName] = useState("");
    const [contactName, setContactName] = useState("");
    const [submittingRecruiter, setSubmittingRecruiter] = useState(false);
    const [sessionLoading, setSessionLoading] = useState(true);
    const [authBusy, setAuthBusy] = useState(false);

    useEffect(() => {
        async function restoreSession() {
            try {
                const { data, error } = await supabase.auth.getSession();
                if (error) throw error;
                setUser(data.session?.user ?? null);
            } catch (error) {
                setMessage(error.message || "Unable to restore your session.");
            } finally {
                setSessionLoading(false);
            }
        }
        restoreSession();
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function loadProfile() {
            setFullName("");
            setStudyProgram("")
            setGraduationYear("");
            setVisibleToRecruiters(false);

            if (!user) {
                return;
            }

            const { data, error } = await supabase
                .from('member')
                .select('full_name, study_program, graduation_year, visible_to_recruiters')
                .eq('user_id', user.id)
                .maybeSingle();

            if (cancelled) {
                return;
            }

            if (error) {
                setMessage(error.message);
            } else {
                setFullName(data?.full_name ?? '');
                setStudyProgram(data?.study_program ?? "");
                setGraduationYear(
                    data?.graduation_year == null
                        ? ""
                        : String(data.graduation_year)
                    )
                setVisibleToRecruiters(data?.visible_to_recruiters ?? false);            }
        }

        loadProfile();

        return () => {
            cancelled = true;
        };
    }, [user]);

    useEffect(() => {
        let cancelled = false;

        async function loadCvs() {
            setCvs([]);

            if (!user) {
                return;
            }

            const { data, error } = await supabase
                .from("cv")
                .select("id, original_filename, file_path, uploaded_at")
                .order("uploaded_at", { ascending: false });

            if (cancelled) {
                return;
            }

            if (error) {
                setMessage(error.message);
            } else {
                setCvs(data ?? []);
            }
        }

        loadCvs();

        return () => {
            cancelled = true;
        };
    }, [user, cvListVersion]);


    async function handlelogin(event) {
        event.preventDefault();
        if (authBusy) return;
        setAuthBusy(true);
        setMessage("Logging in...");
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(), password,
            });
            if (error) throw error;
            setUser(data.user);
            setPassword("");
            setMessage("Welcome back. You are logged in.");
        } catch (error) {
            setMessage(error.message || "Unable to log in. Please try again.");
        } finally {
            setAuthBusy(false);
        }
    }

    async function handleRegister() {
        if (authBusy) return;
        if (!email.trim() || !password) {
            setMessage("Enter your email and password to create an account.");
            return;
        }
        setAuthBusy(true);
        setMessage("Creating account...");
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(), password,
            });
            if (error) throw error;
            setPassword("");
            if (data.session) {
                setUser(data.user);
                setMessage("Account created. Welcome to the portal.");
            } else {
                setMessage("Check your email to confirm your account before logging in.");
            }
        } catch (error) {
            setMessage(error.message || "Unable to create your account.");
        } finally {
            setAuthBusy(false);
        }
    }

    async function handleLogout() {
        const { error } = await supabase.auth.signOut();

        if (error) {
            setMessage(error.message);
        
        } else {
            setUser(null);
            setPassword("");
            setCvFile(null);
            setMessage("You are logged out.");
            setCompanyName("");
            setContactName("");
            setPortalView("member");
        }
    }

    async function handleSaveProfile() {
        if (!user) {
            setMessage("Please log in first")
            return;
        }

        if (!fullName.trim()) {
            setMessage("Please enter your full name".trim())
            return;
        }

        setMessage("Saving profile")

        const { error } = await supabase
            .from("member")
            .upsert(
                {
                    user_id: user.id,
                    full_name: fullName.trim(),
                    email: user.email,
                    study_program: studyProgram.trim(),
                    graduation_year: graduationYear === ""
                        ? null
                        : Number(graduationYear),
                    visible_to_recruiters: visibleToRecruiters,
                },
                {
                    onConflict: "user_id",
                }
            )
        
        if (error) {
            setMessage(error.message);

        } else {

            setMessage("Your profile has been saved.");
        }
    };

async function handleUploadCv() {
    if (!user || !cvFile) {
        setMessage('Log in and select a PDF first.');
        return;
    }

    if (cvFile.type !== 'application/pdf') {
        setMessage('Please select a PDF file.');
        return;
    }

    if (cvFile.size > 5 * 1024 * 1024) {
        setMessage('The PDF must be 5 MB or smaller.');
        return;
    }

    setUploading(true);
    setMessage('Uploading CV...');

    try {
        const filePath = `${user.id}/${crypto.randomUUID()}.pdf`;

        const { data: profile, error: profileError } = await supabase
            .from("member")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

        if (profileError) {
            throw profileError;
        }

        if (!profile) {
            throw new Error("Please save your member profile first");
        }   

        const { error } = await supabase.storage
            .from('cvs')
            .upload(filePath, cvFile, {
                contentType: 'application/pdf',
                upsert: false,
            });

        if (error) {
            throw error;
        }

    const { error: recordError } = await supabase
        .from('cv')
        .insert({
            profile_id: profile.id,
            file_path: filePath,
            original_filename: cvFile.name,
            uploaded_at: new Date().toISOString(),
            is_active: true,
        });

if (recordError) {
    throw new Error(
        `PDF uploaded, but saving its record failed: ${recordError.message}`
    );
}

setCvListVersion(previous => previous + 1);

setMessage('CV uploaded and linked to your profile!');

    } catch (error) {
        setMessage(error.message || 'Upload failed. Please try again.');
    } finally {
        setUploading(false);
    }
}

async function handleOpenCvs(filePath) {
    const newTab = window.open("about:blank", "_blank");
    if (!newTab) {
        setMessage("Please allow popups to open your CV in a new tab.");
        return;
    }
    newTab.opener = null;
    setMessage("Opening CV...");
    try {
        const { data, error } = await supabase.storage
            .from("cvs")
            .createSignedUrl(filePath, 60);
        if (error) throw error;
        newTab.location.href = data.signedUrl;
        setMessage("");
    } catch (error) {
        newTab.close();
        setMessage(error.message || "Unable to open the CV.");
    }
}

async function handleDeleteCv(cv) {
    if (!user || deletingId !== null) {
        return;
    }

    const confirmed = window.confirm(
        `Permanently delete "${cv.original_filename}"?`
    );

    if (!confirmed) {
        return;
    }

    setDeletingId(cv.id);
    setMessage("Deleting CV...");

    try {

        const { error: fileError } = await supabase.storage
            .from("cvs")
            .remove([cv.file_path]);

        if (fileError) {
            throw fileError;
        }

        const { data, error: recordError } = await supabase
            .from("cv")
            .delete()
            .eq("id", cv.id)
            .select("id")
            .single();


        if (recordError) {
            throw new Error(
                `The file removal finished, but deleting its record failed: ${recordError.message}`
            );
        }

        setCvs(previous => previous.filter(item => item.id !== data.id));
        setMessage("CV deleted");
    } catch (error) {
        setMessage(error.message || "Unable to delete the CV");
    } finally {
        setDeletingId(null);
    }
}

async function handleRecruiterApplication() {
    if (!user || submittingRecruiter) {
        return;
    }

    if (!companyName.trim() || !contactName.trim()) {
        setMessage("Please enter you company and contact name");
        return;
    }

    setSubmittingRecruiter(true);
    setMessage("Submitting request...")

    try {
        const { error } = await supabase
            .from("recruiters")
            .insert({
                user_id: user.id,
                company_name: companyName.trim(),
                contact_name: contactName.trim(),
                email: user.email,
                approved: false,
            });
                    if (error) {
            if (error.code === '23505') {
                setMessage('An application already exists for this account.');
                return;
            }

            throw error;
        }

            setMessage('Request submitted! Awaiting Nordlys approval.');
            } catch (error) {
            setMessage(error.message || 'Unable to submit your request.');
            } finally {
                setSubmittingRecruiter(false);
    }
}

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
                            <p className={styles.eyebrow}>NORDLYS NTNU / CAREERS</p>
                            <h1>CV Portal</h1>
                            <div className={styles.heroFoot}>
                                <span className={styles.heroLabel}>THE CV PORTAL</span>
                            </div>
                        </div>
                    </header>

                    <section className={styles.workspace} aria-label="CV portal">
                        <div className={styles.container}>
                            {sessionLoading ? (
                                <div className={styles.loading} role="status">Loading your portal…</div>
                            ) : user ? (
                                <>
                                    <div className={styles.toolbar}>
                                        <div className={styles.tabs} role="group" aria-label="Choose portal">
                                            <button type="button" aria-pressed={portalView === "member"} className={portalView === "member" ? styles.activeTab : ""} onClick={() => { setPortalView("member"); setMessage(""); }}>Member portal</button>
                                            <button type="button" aria-pressed={portalView === "recruiter"} className={portalView === "recruiter" ? styles.activeTab : ""} onClick={() => { setPortalView("recruiter"); setMessage(""); }}>Recruiter portal</button>
                                        </div>
                                        <div className={styles.account}>
                                            <span title={user.email}>{user.email}</span>
                                            <button type="button" className={styles.textButton} onClick={handleLogout}>Log out ↗</button>
                                        </div>
                                    </div>
                                    {message && <p className={styles.notice} role="status">{message}</p>}
                                    {portalView === "member" ? (
                                        <>
                                            <div className={styles.sectionHeading}>
                                                <div><h2>Member dashboard</h2></div>
                                            </div>
                                            <div className={styles.dashboard}>
                                                <section className={styles.card} aria-labelledby="profile-title">
                                                    <div className={styles.cardHeading}><span className={styles.step}>01</span><div><h3 id="profile-title">Your profile</h3><p>The person behind the projects.</p></div></div>
                                                    <form onSubmit={event => { event.preventDefault(); handleSaveProfile(); }}>
                                                        <div className={styles.field}><label htmlFor="full-name">Full name</label><input id="full-name" autoComplete="name" required value={fullName} onChange={event => setFullName(event.target.value)} placeholder="Your full name" /></div>
                                                        <div className={styles.field}><label htmlFor="study-program">Study program</label><input id="study-program" value={studyProgram} onChange={event => setStudyProgram(event.target.value)} placeholder="e.g. Computer Science" /></div>
                                                        <div className={styles.field}><label htmlFor="graduation-year">Graduation year <span>Optional</span></label><input id="graduation-year" type="number" min="2000" max="2100" value={graduationYear} onChange={event => setGraduationYear(event.target.value)} placeholder="e.g. 2027" /></div>
                                                        <label className={styles.consent}><input type="checkbox" checked={visibleToRecruiters} onChange={event => setVisibleToRecruiters(event.target.checked)} /><span><strong>Open to opportunities</strong><span>Allow approved recruiters to view my profile and CV after I save.</span></span></label>
                                                        <button type="submit" className={styles.primary}>Save profile <span aria-hidden="true">↗</span></button>
                                                    </form>
                                                </section>
                                                <div className={styles.cvColumn}>
                                                    <section className={styles.card} aria-labelledby="upload-title">
                                                        <div className={styles.cardHeading}><span className={styles.step}>02</span><div><h3 id="upload-title">Your CV</h3><p>A little more about what you bring.</p></div></div>
                                                        <div className={styles.uploadBox}>
                                                            <span className={styles.fileSymbol} aria-hidden="true">↑</span>
                                                            <label htmlFor="cv-file">Upload your CV</label>
                                                            <p id="cv-help">PDF only · Maximum 5 MB</p>
                                                            <input id="cv-file" type="file" accept=".pdf,application/pdf" aria-describedby="cv-help" disabled={uploading} onChange={event => setCvFile(event.target.files?.[0] ?? null)} />
                                                        </div>
                                                        {cvFile && <p className={styles.selectedFile}>Ready to upload: <strong>{cvFile.name}</strong></p>}
                                                        <button type="button" className={styles.primary} onClick={handleUploadCv} disabled={uploading || !cvFile}>{uploading ? "Uploading…" : "Upload CV"}<span aria-hidden="true">↑</span></button>
                                                        <p className={styles.caption}>Your files are stored privately. You choose whether approved recruiters may access them.</p>
                                                    </section>
                                                    <section className={styles.card} aria-labelledby="files-title">
                                                        <div className={styles.listHeading}><h3 id="files-title">Uploaded CVs</h3><span className={styles.count}>{cvs.length}</span></div>
                                                        {cvs.length === 0 ? <div className={styles.empty}><p>No CVs yet.</p><span>Your uploaded documents will appear here.</span></div> : (
                                                            <ul className={styles.fileList}>{cvs.map(cv => (
                                                                <li key={cv.id}>
                                                                    <span className={styles.pdfBadge}>PDF</span>
                                                                    <div className={styles.fileDetails}><strong>{cv.original_filename}</strong><span>{cv.uploaded_at ? new Date(cv.uploaded_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Uploaded document"}</span></div>
                                                                    <div className={styles.fileActions}><button type="button" onClick={() => handleOpenCvs(cv.file_path)}>Open ↗</button><button type="button" className={styles.deleteButton} onClick={() => handleDeleteCv(cv)} disabled={deletingId !== null}>{deletingId === cv.id ? "Deleting…" : "Delete"}</button></div>
                                                                </li>
                                                            ))}</ul>
                                                        )}
                                                    </section>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>MEET THE PEOPLE BEHIND NORDLYS</p><h2>Recruiter portal</h2></div><p>Great teams start<br />with a conversation.</p></div>
                                            <div className={styles.recruiterGrid}>
                                                <aside className={styles.recruiterAside}>
                                                    <p>Connect with the Nordlys teammembers</p>
                                                    <ol className={styles.steps}><li><span>01</span>Tell us about your company</li><li><span>02</span>Nordlys reviews your request</li><li><span>03</span>Connect with participating members</li></ol>
                                                </aside>
                                                <section className={styles.card} aria-labelledby="request-title">
                                                    <span className={styles.badge}>ACCESS BY APPROVAL</span>
                                                    <h3 id="request-title">Request recruiter access</h3>
                                                    <p className={styles.cardIntro}>Introduce yourself. Our team will review your request before you can browse shared profiles and CVs.</p>
                                                    <form onSubmit={event => { event.preventDefault(); handleRecruiterApplication(); }}>
                                                        <div className={styles.field}><label htmlFor="company-name">Company name</label><input id="company-name" autoComplete="organization" required value={companyName} onChange={event => setCompanyName(event.target.value)} placeholder="Your company" /></div>
                                                        <div className={styles.field}><label htmlFor="contact-name">Contact name</label><input id="contact-name" autoComplete="name" required value={contactName} onChange={event => setContactName(event.target.value)} placeholder="Your full name" /></div>
                                                        <div className={styles.applicationEmail}><span>APPLICATION EMAIL</span><strong>{user.email}</strong></div>
                                                        <button type="submit" className={styles.primary} disabled={submittingRecruiter}>{submittingRecruiter ? "Submitting…" : "Submit request"}<span aria-hidden="true">↗</span></button>
                                                        <p className={styles.caption}>Submitting a request does not automatically grant access.</p>
                                                    </form>
                                                </section>
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className={styles.loginGrid}>
                                    <div className={styles.loginIntro}><h2>CV portal<br /></h2><div className={styles.introRule} /><span>Member profiles · Private CVs · Approved recruiters</span></div>
                                    <section className={styles.card} aria-labelledby="login-title">
                                        <span className={styles.badge}>WELCOME TO NORDLYS</span>
                                        <h3 id="login-title">Make the connection.</h3>
                                        <p className={styles.cardIntro}>Log in to your account, or create one to get started.</p>
                                        {message && <p className={styles.notice} role="status">{message}</p>}
                                        <form onSubmit={handlelogin}>
                                            <div className={styles.field}><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" disabled={authBusy} /></div>
                                            <div className={styles.field}><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} placeholder="Your password" disabled={authBusy} /></div>
                                            <button type="submit" className={styles.primary} disabled={authBusy}>{authBusy ? "Please wait…" : "Log in"}<span aria-hidden="true">↗</span></button>
                                            <div className={styles.registerRow}><span>New to the portal?</span><button type="button" className={styles.textButton} onClick={handleRegister} disabled={authBusy}>Create an account ↗</button></div>
                                        </form>
                                    </section>
                                </div>
                            )}
                            <div className={styles.bottomNote}><span className={styles.smallDot} />Part of Nordlys NTNU. Built for the journey ahead.</div>
                        </div>
                    </section>
                </div>
            </Layout>
        </>
    );
}
