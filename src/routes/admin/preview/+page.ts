import type { PageLoad } from './$types';

export const ssr = false;
export const prerender = true;

export const load: PageLoad = async ({ url, fetch }) => {
	const response = await fetch('/api/content');
	return {
		initialSnapshot: await response.json(),
		type: url.searchParams.get('type') ?? 'site',
		slug: url.searchParams.get('slug') ?? 'site'
	};
};
