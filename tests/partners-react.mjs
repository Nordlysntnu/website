// REACT_TEST_RUNTIME=/private/tmp/nordlys-member-validation node --test tests/partners-react.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
const runtime = process.env.REACT_TEST_RUNTIME
    ? createRequire(`${process.env.REACT_TEST_RUNTIME}/package.json`)
    : require;
const React = runtime('react');
const { act, create } = runtime('react-test-renderer');
const ts = require('typescript');
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
function component(file, client = {}) {
    const code = ts.transpileModule(
        readFileSync(new URL(file, import.meta.url), 'utf8'),
        {
            compilerOptions: {
                module: ts.ModuleKind.CommonJS,
                target: ts.ScriptTarget.ES2020,
                jsx: ts.JsxEmit.ReactJSX,
                esModuleInterop: true,
            },
        }
    ).outputText;
    const module = { exports: {} };
    vm.runInNewContext(code, {
        exports: module.exports,
        module,
        console,
        require: (name) =>
            name === 'react'
                ? React
                : name === 'react/jsx-runtime'
                  ? runtime(name)
                  : name.includes('supabaseClient')
                    ? { supabase: client }
                    : name.endsWith('.css')
                      ? { __esModule: true, default: {} }
                      : require(name),
    });
    return module.exports.default;
}
const portal = {
    authMode: 'login',
    recovering: false,
    user: null,
    message: '',
    email: '',
    password: '',
    authBusy: false,
};

test('public login only offers partner login', () => {
    const Panel = component('../src/features/cv/AuthPanel.js');
    let renderer;
    act(() => {
        renderer = create(
            React.createElement(Panel, {
                portal: {
                    ...portal,
                    authMode: 'partner-login',
                    memberSite: false,
                },
            })
        );
    });
    try {
        const text = JSON.stringify(renderer.toJSON());
        assert.match(text, /Partner login/);
        assert.doesNotMatch(text, /Member login|Create a member account/);
        assert.doesNotMatch(
            text,
            /Request company access|Submit request|register-recruiter/
        );
    } finally {
        act(() => renderer.unmount());
    }
});

test('partner login accepts a username and offers no email reset', () => {
    const Panel = component('../src/features/cv/AuthPanel.js');
    let renderer;
    act(() => {
        renderer = create(
            React.createElement(Panel, {
                portal: { ...portal, authMode: 'partner-login' },
            })
        );
    });
    try {
        const input = renderer.root.findByProps({ id: 'email' });
        assert.equal(input.props.type, 'text');
        assert.equal(input.props.autoComplete, 'username');
        assert.doesNotMatch(
            JSON.stringify(renderer.toJSON()),
            /Forgot password\?/
        );
    } finally {
        act(() => renderer.unmount());
    }
});

test('unlinked accounts get invite-only guidance and cannot submit an application', async () => {
    const calls = [];
    const client = {
        rpc: async (name) => {
            calls.push(name);
            return { data: false, error: null };
        },
    };
    const Dashboard = component(
        '../src/features/cv/PartnerDashboard.js',
        client
    );
    let renderer;
    await act(async () => {
        renderer = create(
            React.createElement(Dashboard, {
                portal: { ...portal, user: { id: 'external' } },
            })
        );
        await tick();
    });
    try {
        const text = JSON.stringify(renderer.toJSON());
        assert.match(text, /No active partner access/);
        assert.equal(renderer.root.findAllByType('form').length, 0);
        assert.deepEqual(calls, ['has_partner_access']);
    } finally {
        act(() => renderer.unmount());
    }
});

test('active partners can browse the existing scoped member search', async () => {
    const calls = [];
    const client = {
        rpc: async (name, args) => {
            calls.push({ name, args });
            return {
                data:
                    name === 'has_partner_access'
                        ? true
                        : [
                              {
                                  profile_id: 'member',
                                  full_name: 'Shared Member',
                                  study_year: 2,
                                  team_role: 'Electronics',
                                  study_program: 'Computing',
                                  graduation_year: 2028,
                                  file_path: 'member/current.pdf',
                                  original_filename: 'CV.pdf',
                                  total_count: 1,
                              },
                          ],
                error: null,
            };
        },
    };
    const Dashboard = component(
        '../src/features/cv/PartnerDashboard.js',
        client
    );
    let renderer;
    await act(async () => {
        renderer = create(
            React.createElement(Dashboard, {
                portal: { ...portal, user: { id: 'partner' } },
            })
        );
        await tick();
    });
    try {
        assert.match(JSON.stringify(renderer.toJSON()), /Shared Member/);
        assert.match(JSON.stringify(renderer.toJSON()), /Study year.*2/);
        assert.equal(calls[1].name, 'search_partner_members');
        assert.equal(calls[1].args.p_team_role, '');
        assert.match(JSON.stringify(renderer.toJSON()), /Electronics/);
        assert.match(JSON.stringify(renderer.toJSON()), /Computing/);
        await act(async () => {
            renderer.root
                .findByProps({ id: 'team-role-search' })
                .props.onChange({ target: { value: 'Electronics' } });
        });
        await act(async () => {
            renderer.root
                .findByType('form')
                .props.onSubmit({ preventDefault() {} });
            await tick();
        });
        assert.equal(calls.at(-1).args.p_team_role, 'Electronics');
        assert.doesNotMatch(
            JSON.stringify(renderer.toJSON()),
            /Submit request/
        );
    } finally {
        act(() => renderer.unmount());
    }
});
