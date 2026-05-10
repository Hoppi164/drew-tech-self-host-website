import { json } from '@sveltejs/kit';
import { getSiteSnapshot } from '$lib/content/server';

export const prerender = true;

export async function GET() {
	return json(await getSiteSnapshot());
}
