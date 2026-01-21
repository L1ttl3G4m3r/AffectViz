import { json } from '@sveltejs/kit';

const POLAR_API_BASE_URL = 'https://www.polaraccesslink.com/v3';
const ACCESS_TOKEN_COOKIE = 'polar_access_token';
const USER_ID_COOKIE = 'polar_user_id';

/* ============================================================
   GET /api/... (Fetch Polar user profile)
   ============================================================ */

export async function GET({ cookies, fetch }) {
	const accessToken = cookies.get(ACCESS_TOKEN_COOKIE);
	const userId = cookies.get(USER_ID_COOKIE);

	/* Must have valid access token */
	if (!accessToken) {
		return json({ error: 'Missing access token (not logged in)' }, { status: 401 });
	}

	/* Must have user id to build Polar endpoint */
	if (!userId) {
		return json({ error: 'Missing Polar user id cookie' }, { status: 401 });
	}

	/* POLAR API REQUEST */
	const url = `${POLAR_API_BASE_URL}/users/${userId}`;

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${accessToken}`
		}
	});

	/* ERROR HANDLING */
	if (!response.ok) {
		/* Polar sometimes returns non-JSON error details */
		const details = await response.text();

		return json(
			{
				error: 'Polar API request failed',
				status: response.status,
				details
			},
			{ status: response.status }
		);
	}

	const data = await response.json();
	return json(data);
}
