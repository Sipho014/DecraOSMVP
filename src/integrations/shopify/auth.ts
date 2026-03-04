import crypto from 'crypto';

const STATE_COOKIE = 'shopify_oauth_state';
const SHOP_COOKIE = 'shopify_shop';

export function makeState() {
  return crypto.randomBytes(16).toString('hex');
}

export function getStateCookieName() {
  return STATE_COOKIE;
}

export function getShopCookieName() {
  return SHOP_COOKIE;
}

export function buildAuthUrl(opts: { shop: string; state: string; redirectUri: string }) {
  // Note: @shopify/shopify-api doesn't provide a one-liner without a full session store.
  // So we build the URL manually.
  const scopes = (process.env.SHOPIFY_SCOPES || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .join(',');

  const params = new URLSearchParams({
    client_id: process.env.SHOPIFY_API_KEY!,
    scope: scopes,
    redirect_uri: opts.redirectUri,
    state: opts.state,
  });

  // (Optional but recommended) add grant_options[]=per-user if you want online tokens.
  // For MVP we use offline access token.
  return `https://${opts.shop}/admin/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForAccessToken(opts: {
  shop: string;
  code: string;
}): Promise<string> {
  const tokenUrl = `https://${opts.shop}/admin/oauth/access_token`;

  const resp = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code: opts.code,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Shopify token exchange failed (${resp.status}): ${text}`);
  }

  const json = (await resp.json()) as { access_token: string };
  return json.access_token;
}
