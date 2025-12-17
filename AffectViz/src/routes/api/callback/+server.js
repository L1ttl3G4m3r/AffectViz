import { redirect } from '@sveltejs/kit';

export async function GET({ url, cookies }) {
  try {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state'); // optional if you use state

    console.log('[Callback] Received query parameters:', Object.fromEntries(url.searchParams));

    if (!code) {
      console.error('[Callback] No authorization code returned from Polar');
      return new Response('No authorization code returned', { status: 400 });
    }

    console.log('[Callback] Authorization code:', code);

    const basicAuth = Buffer.from(
      `${process.env.POLAR_CLIENT_ID}:${process.env.POLAR_CLIENT_SECRET}`
    ).toString('base64');

    const tokenRes = await fetch('https://polarremote.com/v2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.POLAR_REDIRECT_URI
      })
    });

    const tokenData = await tokenRes.json();
    console.log('[Callback] Token response:', tokenData);

    if (!tokenData.access_token) {
      console.error('[Callback] Failed to obtain access token');
      return new Response(
        'Failed to get access token: ' + JSON.stringify(tokenData),
        { status: 500 }
      );
    }

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

    console.log('[Callback] Access and refresh tokens stored in cookies');

    try {
      const registerRes = await fetch('https://www.polaraccesslink.com/v3/users', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ "user-id": "~user" })
      });

      const text = await registerRes.text();
      const registerData = text ? JSON.parse(text) : {};
      console.log('[Callback] User registration response:', registerData);

    } catch (err) {
      console.error('[Callback] Failed to register user:', err);
    }

    throw redirect(302, '/dashboard');

  } catch (err) {
    if (err instanceof redirect) throw err;

    console.error('[Callback] Unexpected error:', err);
    return new Response(
      'Internal server error: ' + (err?.message || 'unknown'),
      { status: 500 }
    );
  }
}
