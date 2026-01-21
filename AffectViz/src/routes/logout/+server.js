import { redirect } from '@sveltejs/kit';

export async function GET({ cookies }) {
	cookies.delete('polar_access_token', { path: '/' });
	cookies.delete('polar_refresh_token', { path: '/' });
	cookies.delete('polar_user_id', { path: '/' });

	throw redirect(302, '/');
}
