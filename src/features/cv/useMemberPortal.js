import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import {
    hasMemberEmail,
    isConfirmedMember,
    validateProfile,
    validatePdfFile,
    listStoredCvs,
    removeStoredCv,
} from '../../../lib/memberPortal.mjs';

const CV_COLUMNS =
    'id, profile_id, original_filename, file_path, uploaded_at, is_active, deletion_pending';

export default function useMemberPortal(memberSite = false) {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [sessionLoading, setSessionLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authMode, setAuthMode] = useState(memberSite ? 'login' : 'partner-login');
    const portalPath = memberSite ? '/memberlogin' : '/cv';
    const [authBusy, setAuthBusy] = useState(false);
    const [recovering, setRecovering] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [teamRole, setTeamRole] = useState('');
    const [studyProgram, setStudyProgram] = useState('');
    const [studyYear, setStudyYear] = useState('');
    const [graduationYear, setGraduationYear] = useState('');
    const [visibleToRecruiters, setVisibleToRecruiters] = useState(false);
    const [savedVisibleToRecruiters, setSavedVisibleToRecruiters] = useState(false);
    const [profileId, setProfileId] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);
    const [cvs, setCvs] = useState([]);
    const [unlinkedFiles, setUnlinkedFiles] = useState([]);
    const [cvsLoading, setCvsLoading] = useState(false);
    const [cvsError, setCvsError] = useState('');
    const [cvFile, setCvFile] = useState(null);
    const [cvVersion, setCvVersion] = useState(0);
    const [profileVersion, setProfileVersion] = useState(0);
    const [cvBusy, setCvBusy] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fileInputKey, setFileInputKey] = useState(0);
    const operationLock = useRef(false);
    const authLock = useRef(false);
    const generation = useRef(0);
    const isMember = isConfirmedMember(user);

    function notify(text, type = 'info') {
        setMessage(text);
        setMessageType(type);
    }

    useEffect(() => {
        let active = true;
        let receivedEvent = false;
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, next) => {
            if (!active) return;
            receivedEvent = true;
            generation.current += 1;
            setSession(next ? { ...next } : null);
            setSessionLoading(Boolean(next));
            if (!next) setUser(null);
            if (event === 'PASSWORD_RECOVERY') setRecovering(true);
            if (event === 'SIGNED_OUT') setRecovering(false);
        });
        const params = new URLSearchParams(window.location.search);
        if (params.get('reset') === '1') setRecovering(true);
        const linkError = new URLSearchParams(
            window.location.hash.slice(1)
        ).get('error_description');
        if (linkError) notify(linkError, 'error');
        supabase.auth
            .getSession()
            .then(({ data, error }) => {
                if (!active || receivedEvent) return;
                if (error) throw error;
                setSession(data.session);
                setSessionLoading(Boolean(data.session));
            })
            .catch((error) => {
                if (active) {
                    notify(error.message, 'error');
                    setSessionLoading(false);
                }
            });
        return () => {
            active = false;
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        if (!session) {
            setUser(null);
            setSessionLoading(false);
            return;
        }
        setSessionLoading(true);
        supabase.auth
            .getUser()
            .then(({ data, error }) => {
                if (cancelled) return;
                if (error) throw error;
                setUser(data.user);
            })
            .catch((error) => {
                if (!cancelled) {
                    setUser(null);
                    notify(error.message, 'error');
                }
            })
            .finally(() => {
                if (!cancelled) setSessionLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [session]);

    useEffect(() => {
        let cancelled = false;
        setFullName('');
        setStudyProgram('');
        setTeamRole('');
        setGraduationYear('');
        setStudyYear('');
        setVisibleToRecruiters(false);
        setSavedVisibleToRecruiters(false);
        setProfileId(null);
        setProfileError('');
        setCvFile(null);
        setFileInputKey((key) => key + 1);
        if (!isMember) {
            setProfileLoading(false);
            return;
        }
        setProfileLoading(true);
        supabase
            .from('member')
            .select(
                'id, full_name, team_role, study_program, study_year, graduation_year, visible_to_recruiters'
            )
            .eq('user_id', user.id)
            .maybeSingle()
            .then(({ data, error }) => {
                if (cancelled) return;
                if (error) throw error;
                setProfileId(data?.id ?? null);
                setFullName(data?.full_name ?? '');
                setTeamRole(data?.team_role ?? '');
                setStudyProgram(data?.study_program ?? '');
                setStudyYear(
                    data?.study_year == null ? '' : String(data.study_year)
                );
                setGraduationYear(
                    data?.graduation_year == null
                        ? ''
                        : String(data.graduation_year)
                );
                setVisibleToRecruiters(data?.visible_to_recruiters ?? false);
                setSavedVisibleToRecruiters(
                    data?.visible_to_recruiters ?? false
                );
            })
            .catch((error) => {
                if (!cancelled) setProfileError(error.message);
            })
            .finally(() => {
                if (!cancelled) setProfileLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [user?.id, isMember, profileVersion]);

    useEffect(() => {
        let cancelled = false;
        setCvs([]);
        setUnlinkedFiles([]);
        setCvsError('');
        if (!isMember) {
            setCvsLoading(false);
            return;
        }
        setCvsLoading(true);
        async function load() {
            const { data, error } = await supabase
                .from('cv')
                .select(CV_COLUMNS)
                .order('uploaded_at', { ascending: false });
            if (error) throw error;
            if (cancelled) return;
            setCvs(data || []);
            const stored = await listStoredCvs(supabase, user.id);
            if (cancelled) return;
            const linked = new Set((data || []).map((cv) => cv.file_path));
            setUnlinkedFiles(
                stored.filter((file) => !linked.has(file.file_path))
            );
        }
        load()
            .catch((error) => {
                if (!cancelled) setCvsError(error.message);
            })
            .finally(() => {
                if (!cancelled) setCvsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [user?.id, isMember, cvVersion]);

    async function handleAuth(event) {
        event.preventDefault();
        if (authLock.current) return;
        let address = email.trim().toLowerCase();
        if (authMode === 'partner-login') {
            if (!/^[a-z0-9][a-z0-9._-]{2,49}$/.test(address)) {
                notify('Enter the partner username Nordlys gave you.', 'error');
                return;
            }
            address = `${address}@partners.nordlysntnu.invalid`;
        }
        if (authMode === 'login' && !hasMemberEmail(address)) {
            notify(
                'Member login requires your @nordlysntnu.no email. Partners should use Partner Login on nordlysntnu.no.',
                'error'
            );
            return;
        }
        if (authMode.startsWith('register') && !hasMemberEmail(address)) {
            notify(
                'Members must use their @nordlysntnu.no email address.',
                'error'
            );
            return;
        }
        if (authMode.startsWith('register') && password.length < 6) {
            notify('Use a password with at least 6 characters.', 'error');
            return;
        }
        authLock.current = true;
        setAuthBusy(true);
        notify('Please wait…');
        try {
            if (authMode === 'reset') {
                const { error } = await supabase.auth.resetPasswordForEmail(
                    address,
                    {
                        redirectTo: `${window.location.origin}${portalPath}?reset=1`,
                    }
                );
                if (error) throw error;
                notify(
                    'If an account exists, a password reset link will be sent to your email.',
                    'success'
                );
            } else if (authMode.startsWith('register')) {
                const { error } = await supabase.auth.signUp({
                    email: address,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}${portalPath}`,
                    },
                });
                if (error) throw error;
                setPassword('');
                notify(
                    'Check your email to confirm your account. Confirmation is required for member access.',
                    'success'
                );
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email: address,
                    password,
                });
                if (error) throw error;
                setPassword('');
                notify('Welcome back.', 'success');
            }
        } catch (error) {
            notify(
                error.message || 'Unable to complete this request.',
                'error'
            );
        } finally {
            authLock.current = false;
            setAuthBusy(false);
        }
    }

    async function resendConfirmation() {
        if (authLock.current || !(user?.email || email.trim())) return;
        authLock.current = true;
        setAuthBusy(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: user?.email || email.trim(),
                options: {
                    emailRedirectTo: `${window.location.origin}${portalPath}`,
                },
            });
            if (error) throw error;
            notify(
                'Confirmation email requested. Check your inbox.',
                'success'
            );
        } catch (error) {
            notify(error.message, 'error');
        } finally {
            authLock.current = false;
            setAuthBusy(false);
        }
    }

    async function updatePassword(event) {
        event.preventDefault();
        if (authLock.current) return;
        if (password.length < 6 || password !== confirmPassword) {
            notify(
                'Use at least 6 characters and make sure both passwords match.',
                'error'
            );
            return;
        }
        authLock.current = true;
        setAuthBusy(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setPassword('');
            setConfirmPassword('');
            setRecovering(false);
            window.history.replaceState(null, '', portalPath);
            notify('Your password has been updated.', 'success');
        } catch (error) {
            notify(error.message, 'error');
        } finally {
            authLock.current = false;
            setAuthBusy(false);
        }
    }

    async function handleLogout() {
        if (cvBusy || savingProfile || authLock.current) return;
        authLock.current = true;
        setAuthBusy(true);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            generation.current += 1;
            setUser(null);
            setSession(null);
            setPassword('');
            setConfirmPassword('');
            setCvFile(null);
            setRecovering(false);
            setAuthMode(memberSite ? 'login' : 'partner-login');
            window.history.replaceState(null, '', portalPath);
            notify('You are logged out.', 'success');
        } catch (error) {
            notify(error.message, 'error');
        } finally {
            authLock.current = false;
            setAuthBusy(false);
        }
    }

    async function handleSaveProfile(event) {
        event?.preventDefault();
        if (
            !isMember ||
            profileLoading ||
            profileError ||
            operationLock.current
        )
            return;
        const started = generation.current;
        operationLock.current = true;
        setSavingProfile(true);
        try {
            const fields = validateProfile({
                fullName,
                teamRole,
                studyProgram,
                studyYear,
                graduationYear,
            });
            const { data, error } = await supabase
                .from('member')
                .upsert(
                    {
                        ...fields,
                        user_id: user.id,
                        email: user.email,
                        visible_to_recruiters: visibleToRecruiters,
                    },
                    { onConflict: 'user_id' }
                )
                .select('id')
                .single();
            if (error) throw error;
            if (started !== generation.current) return;
            setProfileId(data.id);
            setSavedVisibleToRecruiters(visibleToRecruiters);
            notify(
                'Your profile and sharing preference have been saved.',
                'success'
            );
        } catch (error) {
            if (started === generation.current) notify(error.message, 'error');
        } finally {
            operationLock.current = false;
            setSavingProfile(false);
        }
    }

    async function runCvAction(action) {
        if (!isMember || operationLock.current) return;
        const started = generation.current;
        operationLock.current = true;
        setCvBusy(true);
        try {
            const result = await action();
            if (started === generation.current) notify(result, 'success');
        } catch (error) {
            if (started === generation.current)
                notify(error.message || 'The CV action failed.', 'error');
        } finally {
            operationLock.current = false;
            setCvBusy(false);
            setUploading(false);
            if (started === generation.current)
                setCvVersion((version) => version + 1);
        }
    }

    async function handleUploadCv() {
        if (!profileId || cvsLoading || cvsError) {
            notify(
                'Save your profile and load your CV list before uploading.',
                'error'
            );
            return;
        }
        const file = cvFile;
        await runCvAction(async () => {
            await validatePdfFile(file);
            setUploading(true);
            notify('Uploading your CV…');
            const path = `${user.id}/${crypto.randomUUID()}.pdf`;
            const { error } = await supabase.storage
                .from('cvs')
                .upload(path, file, {
                    contentType: 'application/pdf',
                    upsert: false,
                });
            if (error) throw error;
            const { error: recordError } = await supabase.rpc(
                'register_member_cv',
                {
                    p_file_path: path,
                    p_original_filename: file.name,
                }
            );
            if (recordError) {
                throw new Error(
                    `The PDF uploaded, but its registration could not be confirmed. Refresh the CV list and use recovery if needed. ${recordError.message}`
                );
            }
            setCvFile(null);
            setFileInputKey((key) => key + 1);
            return 'CV uploaded. It is now your current CV; older uploads are kept as history.';
        });
    }

    async function handleCurrentCv(cv) {
        await runCvAction(async () => {
            const { error } = await supabase.rpc('set_current_member_cv', {
                p_cv_id: cv.id,
            });
            if (error) throw error;
            return 'Your current CV has been updated.';
        });
    }

    async function handleDeleteCv(cv) {
        if (
            !window.confirm(
                `Permanently delete "${cv.original_filename}"? This removes the PDF and its record.`
            )
        )
            return;
        await runCvAction(async () => {
            const { error: startError } = await supabase.rpc(
                'begin_member_cv_deletion',
                { p_cv_id: cv.id }
            );
            if (startError) throw startError;
            setCvs((previous) =>
                previous.map((item) =>
                    item.id === cv.id
                        ? { ...item, deletion_pending: true, is_active: false }
                        : item
                )
            );
            await removeStoredCv(supabase, user.id, cv.file_path);
            const { error } = await supabase.rpc('finish_member_cv_deletion', {
                p_cv_id: cv.id,
            });
            if (error)
                throw new Error(
                    `The file was removed, but its record remains. Click Retry deletion. ${error.message}`
                );
            return 'CV deleted. Choose another current CV if you deleted your selected one.';
        });
    }

    async function handleUnlinkedFile(file, remove = false) {
        if (
            remove &&
            !window.confirm(
                'Permanently delete this unlinked PDF from Storage?'
            )
        )
            return;
        await runCvAction(async () => {
            if (remove) {
                const { data, error } = await supabase
                    .from('cv')
                    .select('id')
                    .eq('file_path', file.file_path)
                    .maybeSingle();
                if (error) throw error;
                if (data)
                    throw new Error(
                        'This file now has a CV record. Refresh the list to manage it.'
                    );
                await removeStoredCv(supabase, user.id, file.file_path);
                return 'Unlinked PDF deleted.';
            }
            const { error } = await supabase.rpc('register_member_cv', {
                p_file_path: file.file_path,
                p_original_filename: 'Recovered CV.pdf',
            });
            if (error) throw error;
            return 'PDF recovered and selected as your current CV.';
        });
    }

    async function handleOpenCvs(path) {
        if (!isMember) return;
        const tab = window.open('about:blank', '_blank');
        if (!tab) {
            notify('Allow popups to open your CV in a new tab.', 'error');
            return;
        }
        tab.opener = null;
        try {
            const { data, error } = await supabase.storage
                .from('cvs')
                .createSignedUrl(path, 60);
            if (error) throw error;
            tab.location.href = data.signedUrl;
        } catch (error) {
            tab.close();
            notify(error.message || 'Unable to open the PDF.', 'error');
        }
    }

    return {
        user,
        isMember,
        sessionLoading,
        message,
        messageType,
        notify,
        memberSite,
        portalPath,
        email,
        setEmail,
        password,
        setPassword,
        authMode,
        setAuthMode,
        authBusy,
        recovering,
        setRecovering,
        confirmPassword,
        setConfirmPassword,
        handleAuth,
        resendConfirmation,
        updatePassword,
        handleLogout,
        fullName,
        setFullName,
        teamRole,
        setTeamRole,
        studyProgram,
        setStudyProgram,
        studyYear,
        setStudyYear,
        graduationYear,
        setGraduationYear,
        visibleToRecruiters,
        setVisibleToRecruiters,
        savedVisibleToRecruiters,
        profileId,
        profileLoading,
        profileError,
        savingProfile,
        handleSaveProfile,
        retryProfile: () => setProfileVersion((v) => v + 1),
        cvs,
        cvsLoading,
        cvsError,
        unlinkedFiles,
        cvFile,
        setCvFile,
        fileInputKey,
        cvBusy,
        uploading,
        handleUploadCv,
        handleOpenCvs,
        handleDeleteCv,
        handleCurrentCv,
        handleUnlinkedFile,
        refreshCvs: () => setCvVersion((v) => v + 1),
    };
}
