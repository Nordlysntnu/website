export const MEMBER_DOMAIN = 'nordlysntnu.no';
export const MAX_CV_BYTES = 5 * 1024 * 1024;

export function hasMemberEmail(email) {
    const parts = String(email || '')
        .trim()
        .toLowerCase()
        .split('@');
    return (
        parts.length === 2 && parts[0].length > 0 && parts[1] === MEMBER_DOMAIN
    );
}

export function isConfirmedMember(user) {
    return Boolean(user?.email_confirmed_at && hasMemberEmail(user.email));
}

export function validateProfile({
    fullName,
    teamRole = '',
    studyProgram,
    studyYear = '',
    graduationYear,
}) {
    if (!fullName.trim() || fullName.trim().length > 150) {
        throw new Error('Enter your full name (up to 150 characters).');
    }
    if (studyProgram.trim().length > 200) {
        throw new Error('Study program must be 200 characters or fewer.');
    }
    if (teamRole.trim().length > 200) {
        throw new Error('Team role must be 200 characters or fewer.');
    }
    const year = graduationYear === '' ? null : Number(graduationYear);
    if (
        year !== null &&
        (!Number.isInteger(year) || year < 2000 || year > 2100)
    ) {
        throw new Error(
            'Enter a graduation year between 2000 and 2100, or leave it empty.'
        );
    }
    const study =
        studyYear === '' || studyYear == null ? null : Number(studyYear);
    if (
        study !== null &&
        (!Number.isInteger(study) || study < 1 || study > 5)
    ) {
        throw new Error(
            'Enter a study year between 1 and 5, or leave it empty.'
        );
    }
    return {
        team_role: teamRole.trim(),
        study_year: study,
        full_name: fullName.trim(),
        study_program: studyProgram.trim(),
        graduation_year: year,
    };
}

export async function validatePdfFile(file) {
    if (!file || file.size === 0)
        throw new Error('Choose a nonempty PDF file.');
    if (file.size > MAX_CV_BYTES)
        throw new Error('The PDF must be 5 MB or smaller.');
    if (
        !/\.pdf$/i.test(file.name) ||
        (file.type && file.type !== 'application/pdf')
    ) {
        throw new Error('Please select a PDF file.');
    }
    const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    if (String.fromCharCode(...header) !== '%PDF-') {
        throw new Error('This file does not have a valid PDF header.');
    }
}

export async function listStoredCvs(client, userId) {
    const files = [];
    const pageSize = 100;
    for (let offset = 0; ; offset += pageSize) {
        const { data, error } = await client.storage.from('cvs').list(userId, {
            limit: pageSize,
            offset,
            sortBy: { column: 'name', order: 'asc' },
        });
        if (error) throw error;
        files.push(
            ...(data || [])
                .filter((file) => file.id)
                .map((file) => ({
                    ...file,
                    file_path: `${userId}/${file.name}`,
                }))
        );
        if (!data || data.length < pageSize) return files;
    }
}

export async function removeStoredCv(client, userId, filePath) {
    if (filePath.split('/').length !== 2 || filePath.split('/')[0] !== userId) {
        throw new Error('This file is not in your CV folder.');
    }
    const { error } = await client.storage.from('cvs').remove([filePath]);
    if (error) throw error;
    const files = await listStoredCvs(client, userId);
    if (files.some((file) => file.file_path === filePath)) {
        throw new Error(
            'The file is still in Storage. Check your delete policy and retry.'
        );
    }
}
