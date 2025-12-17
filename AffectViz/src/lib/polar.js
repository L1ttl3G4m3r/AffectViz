import { Buffer } from 'buffer';

/**
 * Get a valid access token from cookies or refresh it
 */
export async function getPolarAccessToken(cookies) {
  let token = cookies.get('polar_access_token');
  const refreshToken = cookies.get('polar_refresh_token');

  if (!token && !refreshToken) {
    // No tokens available → user must log in
    throw new Error('No Polar access token. Please login at /login.');
  }

  if (!token && refreshToken) {
    // Refresh the token as before
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
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('Failed to refresh Polar token');

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

    token = tokenData.access_token;
  }

  return token;
}

/**
 * Make an authenticated fetch to Polar API
 */
export async function polarFetch(path, cookies, options = {}) {
  const token = await getPolarAccessToken(cookies);

  const res = await fetch(`https://www.polaraccesslink.com/v3/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...options.headers
    },
    ...options
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Polar API error: ${res.status} ${text}`);
  }

  return res.json();
}
