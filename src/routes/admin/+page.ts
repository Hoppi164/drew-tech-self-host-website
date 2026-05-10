import { base } from '$app/paths';
import type { PageLoad } from './$types';

export const ssr = false;
export const prerender = true;

export const load: PageLoad = async ({ fetch }) => {
	const response = await fetch(`${base}/api/content`);
	return {
		initialSnapshot: await response.json()
	};
};
