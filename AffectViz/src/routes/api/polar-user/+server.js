import { json } from '@sveltejs/kit';

export async function GET({ cookies, fetch }) {
	const accessToken = cookies.get('polar_access_token');
	const userId = cookies.get('polar_user_id');

	if (!accessToken) {
		return json({ error: 'Missing access token (not logged in)' }, { status: 401 });
	}

	if (!userId) {
		return json({ error: 'Missing Polar user id cookie' }, { status: 401 });
	}

	const res = await fetch(`https://www.polaraccesslink.com/v3/users/${userId}`, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${accessToken}`
		}
	});

	if (!res.ok) {
		const text = await res.text();
		return json(
			{ error: 'Polar API request failed', status: res.status, details: text },
			{ status: res.status }
		);
	}

	const data = await res.json();
	return json(data);
}
