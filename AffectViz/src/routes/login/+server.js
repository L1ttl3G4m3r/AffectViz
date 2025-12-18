import { redirect } from '@sveltejs/kit';
import { POLAR_CLIENT_ID, POLAR_REDIRECT_URI } from '$env/static/private';

export const prerender = false;

export function GET() {
  const scope = encodeURIComponent('accesslink.read_all');
  const redirectUri = encodeURIComponent(POLAR_REDIRECT_URI);
  const state = crypto.randomUUID();

  const url =
    `https://flow.polar.com/oauth2/authorization` +
    `?response_type=code` +
    `&client_id=${POLAR_CLIENT_ID}` +
    `&redirect_uri=${redirectUri}` +
    `&scope=${scope}` +
    `&state=${state}`;

  console.log('[Login] Redirecting to Polar OAuth URL:', url);

  throw redirect(302, url);
}
