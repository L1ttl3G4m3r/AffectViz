import { Buffer } from 'buffer';
import { POLAR_CLIENT_ID, POLAR_CLIENT_SECRET } from '$env/static/private';

/* =================================================
   ACCESS TOKEN HANDLING
================================================= */
export async function getPolarAccessToken(cookies) {
  let accessToken = cookies.get('polar_access_token');
  const refreshToken = cookies.get('polar_refresh_token');

  if (!accessToken && !refreshToken) {
    throw new Error('No Polar access token. User must login.');
  }

  // Helper to refresh token
  const refreshAccessToken = async () => {
    if (!refreshToken) throw new Error('No refresh token available');

    const basicAuth = Buffer.from(`${POLAR_CLIENT_ID}:${POLAR_CLIENT_SECRET}`).toString('base64');
    const res = await fetch('https://polarremote.com/v2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });

    const data = await res.json();
    if (!data.access_token) throw new Error('Failed to refresh Polar access token');

    // Update cookies
    cookies.set('polar_access_token', data.access_token, {
      path: '/', httpOnly: true, secure: true, sameSite: 'lax'
    });
    if (data.refresh_token) {
      cookies.set('polar_refresh_token', data.refresh_token, {
        path: '/', httpOnly: true, secure: true, sameSite: 'lax'
      });
    }
    return data.access_token;
  };

  // If access token exists, use it. Otherwise refresh.
  if (!accessToken) {
    accessToken = await refreshAccessToken();
  }

  return accessToken;
}

/* =================================================
   GENERIC POLAR FETCH
================================================= */
export async function polarFetch(path, cookies, options = {}) {
  let token = await getPolarAccessToken(cookies);

  const makeRequest = async () => {
    const res = await fetch(`https://www.polaraccesslink.com/v3/${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        ...(options.headers ?? {})
      }
    });
    return res;
  };

  let res = await makeRequest();

  // If 401, try to refresh token once
  if (res.status === 401) {
    console.warn('[PolarFetch] Access token expired, refreshing...');
    token = await getPolarAccessToken(cookies); // refresh token
    res = await makeRequest();
    if (res.status === 401) {
      const text = await res.text();
      throw new Error(`Polar API unauthorized: ${res.status} ${text}`);
    }
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Polar API error: ${res.status} ${text}`);
  }

  return res.status === 204 ? null : res.json();
}

/* =================================================
   FETCH DAILY ACTIVITY
================================================= */
export async function fetchDailyActivity(cookies, date = 'today') {
  try {
    return await polarFetch(`users/~user/activity/${date}`, cookies);
  } catch (err) {
    if (err.message.includes('404')) return null;
    throw err;
  }
}

/* =================================================
   FETCH SLEEP DATA
================================================= */
export async function fetchSleepData(cookies) {
  try {
    return await polarFetch('users/~user/sleep', cookies);
  } catch (err) {
    if (err.message.includes('404')) return null;
    throw err;
  }
}

/* =================================================
   FETCH NIGHTLY RECHARGE
================================================= */
export async function fetchNightlyRecharge(cookies) {
  try {
    return await polarFetch('users/~user/nightly-recharge', cookies);
  } catch (err) {
    if (err.message.includes('404')) return null;
    throw err;
  }
}

/* =================================================
   FETCH PHYSICAL INFO
================================================= */
export async function fetchPhysicalInfo(cookies) {
  try {
    return await polarFetch('users/~user/physical-information', cookies);
  } catch (err) {
    if (err.message.includes('404')) return null;
    throw err;
  }
}

/* =================================================
   FETCH PROFILE INFO
================================================= */
export async function fetchProfile(cookies) {
  try {
    return await polarFetch('users/~user', cookies);
  } catch (err) {
    if (err.message.includes('404')) return null;
    throw err;
  }
}
