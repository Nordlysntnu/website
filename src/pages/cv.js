import { supabase } from "../../lib/supabaseClient";
import { useEffect, useState } from "react"


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

    useEffect(() => {
        async function restoreSession() {
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                setMessage(error.message);
            } else {
                setUser(data.session?.user ?? null);
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
                setMessage(message.error);
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
        setMessage("Logging in...")

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
        });

        if (error) {
            setMessage(error.message);

        } else {

            setUser(data.user);
            setMessage(`Logged in as ${data.user.email}`);
        }

    }
    
    async function handleRegister() {
        setMessage("Creating account...")

        const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
        });


        if (error){
            setMessage(error.message);      
        } else if (data.session) {

            setUser(data.user);
            setMessage("Account created. You are logged in!")
        
        } else {
        
            setMessage("Check your email to confirm your account before logging in.")
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
            setMessage("Your are logged out.")
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

            setMessage(`Profile ${user.id} saved`);
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

setCvListVersion(previous => + 1)
setMessage("CV uploaded and linked to your profile")

setMessage('CV uploaded and linked to your profile!');

    } catch (error) {
        setMessage(error.message || 'Upload failed. Please try again.');
    } finally {
        setUploading(false);
    }
}

async function handleOpenCvs(filePath) {
    setMessage("Opening CV...")

    try {
        const { data, error } = await supabase.storage
            .from("cvs")
            .createSignedUrl(filePath, 60);

        if (error) {
            throw error;
        }

        window.location.assign(data.signedUrl);
    } catch (error) {
        setMessage(error.message || "Unable to upload CV.")
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

return (
    <div>
        <h1>CV portal</h1>

        {user ? (
            <div>
                <h2>Member dashboard</h2>
                <p>Welcome, {user.email}!</p>
                <input 
                    id="full-name"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={event => setFullName(event.target.value)}
                    />

                <p>You profile name: { fullName }</p>
                
                <label htmlFor="study-program">Studyprogram</label>
                    <input
                        id="study-program"
                        type="text"
                        value={studyProgram}
                        onChange={event => setStudyProgram(event.target.value)}
                    />
                
                <label htmlFor="graduation-year">graduation-year</label>
                    <input
                        id="graduation-year"
                        type="number"
                        min="2000"
                        max="2100"
                        value={graduationYear}
                        onChange={event => setGraduationYear(event.target.value)}
                    />
                


                <button type="button" onClick={handleLogout}>
                    Log out
                </button>

                <button type="button" onClick={ handleSaveProfile }>
                    Save Profile 
                </button>

                <label>
                <input
                    type="checkbox"
                    checked={visibleToRecruiters}
                    onChange={event => setVisibleToRecruiters(event.target.checked)}
                />
                Allow approved recruiters to view my profile and CV.
            </label>
            
            <h2>Your CV</h2>

            <label htmlFor="cv-file">Your CV (PDF)</label>
            <input
                id="cv-file"
                type="file"
                accept=".pdf,application/pdf"
                disabled={uploading}
                onChange={event => setCvFile(event.target.files?.[0] ?? null)}
            />

            {cvFile && <p>Selected file: {cvFile.name}</p>}

            <button
                type="button"
                onClick={handleUploadCv}
                disabled={uploading || !cvFile}
            >
                {uploading ? 'Uploading...' : 'Upload CV'}
            </button>
            
            <h3>Your uploaded CVs</h3>

            {cvs.length === 0 ? (
                <p>No CV records found.</p>
            ) : (
                <ul>
                    {cvs.map(cv => (
                        <li key={cv.id}>
                            {cv.original_filename}

                            <button
                            type="button"
                            onClick={() => handleOpenCvs(cv.file_path)}>
                                Open CV
                            </button>

                            <button
                                type="button"
                                onClick={() => handleDeleteCv(cv)}
                                disabled={deletingId !== null}>
                                {deletingId === cv.id ? 'Deleting...' : 'Delete CV'}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            </div>
        ) : (

            <form onSubmit={handlelogin}>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                />

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                />

                <button type="submit">Log in</button>

                <button type="button" onClick={handleRegister}>
                    Create account
                </button>
            </form>
        )}

        <p role="status">{message}</p>
    </div>
);
}
