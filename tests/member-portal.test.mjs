import test from 'node:test';
import assert from 'node:assert/strict';
import {
    hasMemberEmail,
    isConfirmedMember,
    validateProfile,
    validatePdfFile,
    listStoredCvs,
    removeStoredCv,
} from '../lib/memberPortal.mjs';

test('member identity requires the exact domain and confirmed email', () => {
    assert.equal(hasMemberEmail('Member@NORDLYSNTNU.NO'), true);
    for (const email of [
        'a@nordlysntnu.no.evil.com',
        'a@sub.nordlysntnu.no',
        'a@@nordlysntnu.no',
        '@nordlysntnu.no',
        'a@example.com',
        null,
    ]) {
        assert.equal(hasMemberEmail(email), false, String(email));
    }
    assert.equal(isConfirmedMember({ email: 'a@nordlysntnu.no' }), false);
    assert.equal(
        isConfirmedMember({
            email: 'a@example.com',
            email_confirmed_at: '2026-11-05',
        }),
        false
    );
    assert.equal(
        isConfirmedMember({
            email: 'a@nordlysntnu.no',
            email_confirmed_at: '2026-11-05',
        }),
        true
    );
});

test('profile validation rejects invalid years and whitespace-only names', () => {
    const profile = {
        fullName: ' Member ',
        studyProgram: ' Computing ',
        graduationYear: '',
    };
    assert.deepEqual(validateProfile(profile), {
        team_role: '',
        study_year: null,
        full_name: 'Member',
        study_program: 'Computing',
        graduation_year: null,
    });
    assert.equal(
        validateProfile({ ...profile, graduationYear: '2028' }).graduation_year,
        2028
    );
    for (const year of ['NaN', '2027.5', '1999', '2101']) {
        assert.throws(() =>
            validateProfile({ ...profile, graduationYear: year })
        );
    }
    assert.throws(() => validateProfile({ ...profile, fullName: '   ' }));
});

function file(name, content, type = 'application/pdf') {
    const blob = new Blob([content], { type });
    return { name, type, size: blob.size, slice: blob.slice.bind(blob) };
}

test('PDF validation checks contents and size, allowing a missing browser MIME type', async () => {
    await validatePdfFile(file('CV.PDF', '%PDF-1.7\nexample'));
    await validatePdfFile(file('cv.pdf', '%PDF-1.7', ''));
    await assert.rejects(validatePdfFile(file('fake.pdf', 'not a PDF')));
    await assert.rejects(validatePdfFile(file('cv.txt', '%PDF-1.7')));
    await assert.rejects(validatePdfFile(file('cv.pdf', '')));
    await assert.rejects(
        validatePdfFile(file('cv.pdf', '%PDF-1.7', 'text/plain'))
    );
    await assert.rejects(
        validatePdfFile({
            name: 'cv.pdf',
            type: 'application/pdf',
            size: 5242881,
        })
    );
});

test('Storage reconciliation paginates and ignores folder placeholders', async () => {
    const offsets = [];
    const client = {
        storage: {
            from: () => ({
                list: async (folder, options) => {
                    offsets.push(options.offset);
                    return {
                        data:
                            options.offset === 0
                                ? Array.from({ length: 100 }, (_, i) => ({
                                      id: i === 0 ? null : String(i),
                                      name: `${i}.pdf`,
                                  }))
                                : [{ id: '101', name: 'last.pdf' }],
                    };
                },
            }),
        },
    };
    const result = await listStoredCvs(client, 'owner');
    assert.deepEqual(offsets, [0, 100]);
    assert.equal(result.length, 100);
    assert.equal(result.at(-1).file_path, 'owner/last.pdf');
});

test('delete refuses foreign paths and verifies removal even on a successful response', async () => {
    let removeCalls = 0;
    let present = true;
    const client = {
        storage: {
            from: () => ({
                remove: async () => {
                    removeCalls += 1;
                    return { data: [], error: null };
                },
                list: async () => ({
                    data: present ? [{ id: '1', name: 'cv.pdf' }] : [],
                    error: null,
                }),
            }),
        },
    };
    await assert.rejects(
        removeStoredCv(client, 'owner', 'someone-else/cv.pdf')
    );
    assert.equal(removeCalls, 0);
    await assert.rejects(
        removeStoredCv(client, 'owner', 'owner/cv.pdf'),
        /still in Storage/
    );
    present = false;
    await removeStoredCv(client, 'owner', 'owner/cv.pdf');
});

test('study year is optional and accepts only integers from 1 to 5', () => {
    const profile = {
        fullName: 'Member',
        studyProgram: '',
        graduationYear: '',
    };
    assert.equal(validateProfile(profile).study_year, null);
    for (const year of ['1', '5'])
        assert.equal(
            validateProfile({ ...profile, studyYear: year }).study_year,
            Number(year)
        );
    for (const year of ['0', '6', '2.5', 'invalid'])
        assert.throws(() => validateProfile({ ...profile, studyYear: year }));
});

test('team role is optional, trimmed, and limited to 200 characters', () => {
    const profile = {
        fullName: 'Member',
        studyProgram: '',
        graduationYear: '',
    };
    assert.equal(validateProfile(profile).team_role, '');
    assert.equal(
        validateProfile({ ...profile, teamRole: ' Electronics ' }).team_role,
        'Electronics'
    );
    assert.throws(() =>
        validateProfile({ ...profile, teamRole: 'a'.repeat(201) })
    );
});
