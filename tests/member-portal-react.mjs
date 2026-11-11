// REACT_TEST_RUNTIME=/private/tmp/nordlys-member-validation node --test tests/member-portal-react.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as helpers from '../lib/memberPortal.mjs';
const require = createRequire(import.meta.url);
const runtime = process.env.REACT_TEST_RUNTIME
    ? createRequire(`${process.env.REACT_TEST_RUNTIME}/package.json`)
    : require;
const React = runtime('react');
const { act, create } = runtime('react-test-renderer');
const ts = require('typescript');
const source = ts.transpileModule(
    readFileSync(
        new URL('../src/features/cv/useMemberPortal.js', import.meta.url),
        'utf8'
    ),
    {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2020,
            esModuleInterop: true,
        },
    }
).outputText;
const member = (id) => ({
    id,
    email: `${id}@nordlysntnu.no`,
    email_confirmed_at: '2026-11-05',
});
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

async function mount(initialUser, options = {}) {
    let currentUser = initialUser;
    let onAuth;
    let state;
    let disposed = false;
    const calls = {
        tables: [],
        upserts: 0,
        uploads: 0,
        updates: 0,
        registrations: 0,
        signins: [],
        savedProfiles: [],
    };
    const session = (user) =>
        user ? { user, access_token: `token-${user.id}` } : null;
    const client = {
        auth: {
            signInWithPassword: async (credentials) => {
                calls.signins.push(credentials);
                return { error: null };
            },
            onAuthStateChange(callback) {
                onAuth = callback;
                callback('INITIAL_SESSION', session(currentUser));
                return {
                    data: {
                        subscription: {
                            unsubscribe() {
                                disposed = true;
                            },
                        },
                    },
                };
            },
            getSession: async () => ({
                data: { session: session(currentUser) },
                error: null,
            }),
            getUser: async () => ({ data: { user: currentUser }, error: null }),
            updateUser: async () => {
                calls.updates++;
                return { error: null };
            },
            signOut: async () => {
                currentUser = null;
                onAuth('SIGNED_OUT', null);
                return { error: null };
            },
        },
        from(table) {
            calls.tables.push(table);
            let upsert = false;
            const builder = {
                select() {
                    return builder;
                },
                eq() {
                    return builder;
                },
                upsert(fields) {
                    upsert = true;
                    calls.upserts++;
                    calls.savedProfiles.push(fields);
                    return builder;
                },
                single: async () => ({ data: { id: 'profile' }, error: null }),
                maybeSingle: () =>
                    options.profile?.(currentUser) ||
                    Promise.resolve({
                        data: {
                            id: `profile-${currentUser.id}`,
                            full_name: currentUser.id,
                            study_program: 'Computing',
                            graduation_year: 2028,
                            visible_to_recruiters: false,
                        },
                        error: options.profileError
                            ? { message: 'profile unavailable' }
                            : null,
                    }),
                order: async () => ({ data: [], error: null }),
            };
            return builder;
        },
        storage: {
            from: () => ({
                list: async () => ({ data: [], error: null }),
                upload: async () => {
                    calls.uploads++;
                    return { error: null };
                },
            }),
        },
        rpc: async () => {
            calls.registrations++;
            return { error: null };
        },
    };
    const module = { exports: {} };
    const window = {
        location: { search: '', hash: '', origin: 'http://localhost:3000' },
        history: { replaceState() {} },
        confirm: () => true,
    };
    const context = {
        exports: module.exports,
        module,
        require: (name) =>
            name === 'react'
                ? React
                : name.includes('supabaseClient')
                  ? { supabase: client }
                  : name.includes('memberPortal')
                    ? helpers
                    : require(name),
        window,
        URLSearchParams,
        crypto: globalThis.crypto,
        console,
    };
    vm.runInNewContext(source, context);
    function Harness() {
        state = module.exports.default();
        return null;
    }
    let renderer;
    await act(async () => {
        renderer = create(React.createElement(Harness));
        await tick();
    });
    async function flush(fn = () => {}) {
        await act(async () => {
            await fn();
            await tick();
        });
    }
    return {
        get state() {
            return state;
        },
        calls,
        flush,
        async emit(user, event = 'SIGNED_IN') {
            await flush(() => {
                currentUser = user;
                onAuth(event, session(user));
            });
        },
        close() {
            act(() => renderer.unmount());
            assert.equal(disposed, true);
        },
    };
}

test('restores member data, handles repeated same-token events, clears data on cross-tab logout', async () => {
    const h = await mount(member('A'));
    try {
        assert.equal(h.state.isMember, true);
        assert.equal(h.state.fullName, 'A');
        assert.equal(h.state.profileLoading, false);
        await h.emit(member('A'));
        assert.equal(h.state.sessionLoading, false);
        await h.emit(null, 'SIGNED_OUT');
        assert.equal(h.state.user, null);
        assert.equal(h.state.fullName, '');
        assert.equal(h.state.cvs.length, 0);
    } finally {
        h.close();
    }
});

test('partner usernames map to their Auth login while member email login stays unchanged', async () => {
    const h = await mount(null);
    try {
        await h.flush(() => {
            h.state.setAuthMode('partner-login');
            h.state.setEmail(' PartnerAS ');
            h.state.setPassword('partner-password');
        });
        await h.flush(() => h.state.handleAuth({ preventDefault() {} }));
        assert.equal(
            h.calls.signins[0].email,
            'partneras@partners.nordlysntnu.invalid'
        );
        await h.flush(() => {
            h.state.setAuthMode('login');
            h.state.setEmail(' Member@nordlysntnu.no ');
            h.state.setPassword('member-password');
        });
        await h.flush(() => h.state.handleAuth({ preventDefault() {} }));
        assert.equal(h.calls.signins[1].email, 'member@nordlysntnu.no');
        assert.deepEqual(h.calls.tables, []);
    } finally {
        h.close();
    }
});

test('external and unconfirmed accounts never load member tables or execute saves', async () => {
    for (const user of [
        { ...member('external'), email: 'someone@example.com' },
        { ...member('pending'), email_confirmed_at: null },
    ]) {
        const h = await mount(user);
        try {
            assert.equal(h.state.isMember, false);
            assert.deepEqual(h.calls.tables, []);
            await h.flush(() => h.state.handleSaveProfile());
            assert.equal(h.calls.upserts, 0);
        } finally {
            h.close();
        }
    }
});

test('a failed profile load blocks saving rather than overwriting existing data', async () => {
    const h = await mount(member('A'), { profileError: true });
    try {
        assert.equal(h.state.profileError, 'profile unavailable');
        await h.flush(() => {
            h.state.setFullName('Changed');
        });
        await h.flush(() => h.state.handleSaveProfile());
        assert.equal(h.calls.upserts, 0);
    } finally {
        h.close();
    }
});

test('ignores an old profile response after switching accounts', async () => {
    let resolveOld;
    const old = new Promise((resolve) => {
        resolveOld = resolve;
    });
    const h = await mount(member('A'), {
        profile: (user) =>
            user.id === 'A'
                ? old
                : Promise.resolve({
                      data: { id: 'profile-B', full_name: 'B' },
                      error: null,
                  }),
    });
    try {
        await h.emit(member('B'));
        assert.equal(h.state.fullName, 'B');
        await h.flush(() =>
            resolveOld({
                data: { id: 'profile-A', full_name: 'A' },
                error: null,
            })
        );
        assert.equal(h.state.fullName, 'B');
    } finally {
        h.close();
    }
});

test('password recovery validates matching passwords before contacting Supabase', async () => {
    const h = await mount(member('A'));
    try {
        await h.emit(member('A'), 'PASSWORD_RECOVERY');
        assert.equal(h.state.recovering, true);
        await h.flush(() => {
            h.state.setPassword('long-password-one');
            h.state.setConfirmPassword('different-password');
        });
        await h.flush(() => h.state.updatePassword({ preventDefault() {} }));
        assert.equal(h.calls.updates, 0);
        await h.flush(() => h.state.setConfirmPassword('long-password-one'));
        await h.flush(() => h.state.updatePassword({ preventDefault() {} }));
        assert.equal(h.calls.updates, 1);
        assert.equal(h.state.recovering, false);
        assert.equal(h.state.password, '');
    } finally {
        h.close();
    }
});

test('a rapid double click uploads and registers a CV only once', async () => {
    const h = await mount(member('A'));
    try {
        const blob = new Blob(['%PDF-1.7\nexample'], {
            type: 'application/pdf',
        });
        const file = {
            name: 'test.pdf',
            size: blob.size,
            type: blob.type,
            slice: blob.slice.bind(blob),
        };
        await h.flush(() => h.state.setCvFile(file));
        await h.flush(() =>
            Promise.all([h.state.handleUploadCv(), h.state.handleUploadCv()])
        );
        assert.equal(h.calls.uploads, 1);
        assert.equal(h.calls.registrations, 1);
        assert.equal(h.state.cvFile, null);
        assert.equal(h.state.cvBusy, false);
    } finally {
        h.close();
    }
});

test('member login rejects external email without authenticating it as a partner', async () => {
    const h = await mount(null);
    try {
        await h.flush(() => {
            h.state.setEmail('someone@gmail.com');
            h.state.setPassword('example-password');
        });
        await h.flush(() => h.state.handleAuth({ preventDefault() {} }));
        assert.equal(h.calls.signins.length, 0);
        assert.match(
            h.state.message,
            /Member login requires your @nordlysntnu.no email/
        );
    } finally {
        h.close();
    }
});

test('study year loads, saves as an integer, and clears on logout', async () => {
    const h = await mount(member('A'), {
        profile: () =>
            Promise.resolve({
                data: { id: 'profile-A', full_name: 'Member', study_year: 2 },
                error: null,
            }),
    });
    try {
        assert.equal(h.state.studyYear, '2');
        await h.flush(() => h.state.setStudyYear('3'));
        await h.flush(() => h.state.handleSaveProfile());
        assert.equal(h.calls.savedProfiles[0].study_year, 3);
        await h.flush(() => h.state.setStudyYear(''));
        await h.flush(() => h.state.handleSaveProfile());
        assert.equal(h.calls.savedProfiles[1].study_year, null);
        await h.emit(null, 'SIGNED_OUT');
        assert.equal(h.state.studyYear, '');
    } finally {
        h.close();
    }
});

test('team role loads, saves, and clears when the account changes', async () => {
    const h = await mount(member('A'), {
        profile: () =>
            Promise.resolve({
                data: {
                    id: 'profile-A',
                    full_name: 'Member',
                    team_role: 'Electronics',
                },
                error: null,
            }),
    });
    try {
        assert.equal(h.state.teamRole, 'Electronics');
        await h.flush(() => h.state.setTeamRole('Mechanical'));
        await h.flush(() => h.state.handleSaveProfile());
        assert.equal(h.calls.savedProfiles[0].team_role, 'Mechanical');
        await h.emit(null, 'SIGNED_OUT');
        assert.equal(h.state.teamRole, '');
    } finally {
        h.close();
    }
});
