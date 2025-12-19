import { redirect } from '@sveltejs/kit';
import {
  POLAR_CLIENT_ID,
  POLAR_CLIENT_SECRET,
  POLAR_REDIRECT_URI
} from '$env/static/private';

export const prerender = false;

export async function GET({ url, cookies, fetch }) {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  console.log('[Callback] Query params:', Object.fromEntries(url.searchParams));

  if (!code) {
    console.error('[Callback] Missing authorization code');
    return new Response('Missing authorization code', { status: 400 });
  }

  // ---------------------------------------------------------------------------
  // 1. Exchange authorization code for access token
  // ---------------------------------------------------------------------------
  const basicAuth = Buffer
    .from(`${POLAR_CLIENT_ID}:${POLAR_CLIENT_SECRET}`)
    .toString('base64');

  const tokenRes = await fetch('https://polarremote.com/v2/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: POLAR_REDIRECT_URI
    })
  });

  const tokenData = await tokenRes.json();
  console.log('[Callback] Token response:', tokenData);

  if (!tokenRes.ok || !tokenData.access_token || !tokenData.x_user_id) {
    return new Response(
      'Invalid token response: ' + JSON.stringify(tokenData),
      { status: 500 }
    );
  }

  // ---------------------------------------------------------------------------
  // 2. Persist tokens + Polar user id
  // ---------------------------------------------------------------------------
  const isProd =
    process.env.VERCEL_ENV === 'production' ||
    process.env.NODE_ENV === 'production';

  cookies.set('polar_access_token', tokenData.access_token, {
    path: '/',
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax'
  });

  if (tokenData.refresh_token) {
    cookies.set('polar_refresh_token', tokenData.refresh_token, {
      path: '/',
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax'
    });
  }

  // ⭐ THIS WAS THE MISSING COOKIE ⭐
  cookies.set('polar_user_id', tokenData.x_user_id.toString(), {
    path: '/',
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax'
  });

  console.log('[Callback] Tokens and user id stored in cookies');

  // ---------------------------------------------------------------------------
  // 3. Register user with Polar AccessLink (idempotent)
  // ---------------------------------------------------------------------------
  const registerRes = await fetch(
    'https://www.polaraccesslink.com/v3/users',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        'member-id': tokenData.x_user_id.toString()
      })
    }
  );

  if (![200, 201, 409].includes(registerRes.status)) {
    const txt = await registerRes.text();
    return new Response(
      `User registration failed: ${registerRes.status} ${txt}`,
      { status: 500 }
    );
  }

  console.log('[Callback] User registration status:', registerRes.status);

  // ---------------------------------------------------------------------------
  // 4. Done
  // ---------------------------------------------------------------------------
  throw redirect(302, '/dashboard');
}
