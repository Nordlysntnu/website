import { createClient } from '@supabase/supabase-js';
import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function resetPartnerPassword(admin, username, password) {
    username = String(username || '')
        .trim()
        .toLowerCase();
    if (!/^[a-z0-9][a-z0-9._-]{2,49}$/.test(username))
        throw new Error('Enter a valid partner username.');
    if (typeof password !== 'string' || password.length < 6)
        throw new Error('Use at least 6 characters.');
    const { data: partner, error } = await admin
        .from('partners')
        .select('user_id')
        .eq('username', username)
        .single();
    if (error) throw error;
    if (!partner?.user_id)
        throw new Error('This partner has no linked Auth account.');
    const { data, error: lookupError } = await admin.auth.admin.getUserById(
        partner.user_id
    );
    if (lookupError) throw lookupError;
    if (
        data.user?.email?.toLowerCase() !==
        `${username}@partners.nordlysntnu.invalid`
    ) {
        throw new Error(
            'The linked account does not match this partner username. No password was changed.'
        );
    }
    const { error: updateError } = await admin.auth.admin.updateUserById(
        partner.user_id,
        { password }
    );
    if (updateError) throw updateError;
}

async function main() {
    if (!process.stdin.isTTY || !process.stdout.isTTY)
        throw new Error('Run this in a private interactive terminal.');
    let hidden = false;
    const output = new Writable({
        write(chunk, encoding, done) {
            if (!hidden) process.stdout.write(chunk);
            done();
        },
    });
    const prompt = createInterface({
        input: process.stdin,
        output,
        terminal: true,
    });
    async function secret(label) {
        process.stdout.write(label);
        hidden = true;
        try {
            return await prompt.question('');
        } finally {
            hidden = false;
            process.stdout.write('\n');
        }
    }
    try {
        const username = await prompt.question('Partner username: ');
        const key = await secret(
            'Supabase secret or service-role key (hidden): '
        );
        const password = await secret('New password (6+ characters, hidden): ');
        const confirmation = await secret('Repeat password (hidden): ');
        if (password !== confirmation)
            throw new Error('Passwords do not match.');
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!url)
            throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL in .env.local.');
        const admin = createClient(url, key.trim(), {
            auth: { persistSession: false, autoRefreshToken: false },
        });
        await resetPartnerPassword(admin, username, password);
        console.log(
            'Password updated. Log in with the same partner username and your new password.'
        );
    } finally {
        prompt.close();
    }
}

if (
    process.argv[1] &&
    resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
    main().catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    });
}
