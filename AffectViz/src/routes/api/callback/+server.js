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

  // ---- Exchange authorization code for access token ----
  const basicAuth = Buffer.from(
    `${POLAR_CLIENT_ID}:${POLAR_CLIENT_SECRET}`
  ).toString('base64');

  const tokenResponse = await fetch(
    'https://polarremote.com/v2/oauth2/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: POLAR_REDIRECT_URI
      })
    }
  );

  const tokenData = await tokenResponse.json();
  console.log('[Callback] Token response:', tokenData);

  if (!tokenData.access_token) {
    console.error('[Callback] Token exchange failed');
    return new Response(
      'Token exchange failed: ' + JSON.stringify(tokenData),
      { status: 500 }
    );
  }

  // ---- Store tokens securely in cookies ----
  cookies.set('polar_access_token', tokenData.access_token, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax'
  });

  if (tokenData.refresh_token) {
    cookies.set('polar_refresh_token', tokenData.refresh_token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax'
    });
  }

  console.log('[Callback] Tokens stored in cookies');

  // ---- Register user with Polar AccessLink (safe to repeat) ----
  try {
    const registerRes = await fetch(
      'https://www.polaraccesslink.com/v3/users',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ 'user-id': '~user' })
      }
    );

    const text = await registerRes.text();
    const registerData = text ? JSON.parse(text) : {};
    console.log('[Callback] User registration response:', registerData);
  } catch (err) {
    // Non-fatal — user may already be registered
    console.warn('[Callback] User registration skipped:', err?.message);
  }

  // ---- SUCCESS: redirect to dashboard ----
  throw redirect(302, '/dashboard');
}
