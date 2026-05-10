import type { LayoutServerLoad } from './$types';
import { getSiteSnapshot } from '$lib/content/server';

export const prerender = true;

export const load: LayoutServerLoad = async () => {
	return {
		snapshot: await getSiteSnapshot()
	};
};
