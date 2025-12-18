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

  if (!accessToken && refreshToken) {
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

    cookies.set('polar_access_token', data.access_token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax'
    });

    if (data.refresh_token) {
      cookies.set('polar_refresh_token', data.refresh_token, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
      });
    }

    accessToken = data.access_token;
  }

  return accessToken;
}

/* =================================================
   GENERIC POLAR FETCH
================================================= */
export async function polarFetch(path, cookies, options = {}) {
  const token = await getPolarAccessToken(cookies);

  const res = await fetch(`https://www.polaraccesslink.com/v3/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(options.headers ?? {})
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Polar API error: ${res.status} ${text}`);
  }

  return res.status === 204 ? null : res.json();
}

/* =================================================
   FETCH LATEST EXERCISE
================================================= */
export async function fetchLatestExercise(cookies) {
  let exercisesList = [];
  try {
    exercisesList = await polarFetch('users/~user/exercises', cookies);
  } catch (err) {
    if (err.message.includes('404')) return null;
    throw err;
  }

  if (!Array.isArray(exercisesList) || exercisesList.length === 0) return null;

  const latest = exercisesList.sort((a, b) => new Date(b.upload_time) - new Date(a.upload_time))[0];

  try {
    return await polarFetch(`exercises/${latest.id}`, cookies);
  } catch (err) {
    if (err.message.includes('404')) return null;
    throw err;
  }
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
