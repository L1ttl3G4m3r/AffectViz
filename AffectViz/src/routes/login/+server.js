import { redirect } from '@sveltejs/kit';

export function GET() {
  const clientId = process.env.POLAR_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.POLAR_REDIRECT_URI);
  const scope = encodeURIComponent('accesslink.read_all');

  const url = `https://flow.polar.com/oauth2/authorization` +
              `?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

  console.log('[Login] Redirecting to Polar OAuth URL:', url);
  throw redirect(302, url);
}