// Talks to the CMS, which keeps the adopted panels and starts Vipps payments.
// Requests are "simple" (GET, or POST with text/plain) so browsers send them without a preflight.
const local = process.env.NEXT_PUBLIC_LOCAL_PREVIEW === 'true';
export const CMS_URL = local ? 'http://127.0.0.1:3010' : 'https://cms.nordlysntnu.no';

async function call(path, options) {
    const response = await fetch(`${CMS_URL}/api/adopt/${path}`, { cache: 'no-store', ...options });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || 'The adoption service is not available right now.');
    return body;
}

// { open, taken: [{ id, name, held }] }
export const loadPanels = () => call('panels');

// { reference, redirectUrl }
export const startCheckout = ({ panels, name, showName }) => call('checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify({ panels, name, showName }),
});

// { status: 'pending' | 'paid' | 'cancelled' | 'failed', panels }
export const checkStatus = reference => call(`status?reference=${encodeURIComponent(reference)}`);
