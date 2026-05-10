import { error } from '@sveltejs/kit';
import { getSiteSnapshot } from '$lib/content/server';
import { getPage, resolveThemeKey } from '$lib/content/site';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = async () => {
	const snapshot = await getSiteSnapshot();
	return snapshot.pages.map((page) => ({ slug: page.slug }));
};

export const load: PageServerLoad = async ({ params, parent }) => {
	const { snapshot } = await parent();
	const page = getPage(snapshot, params.slug);
	if (!page) {
		throw error(404, 'Page not found');
	}

	return {
		page,
		themeKey: resolveThemeKey(snapshot, page)
	};
};
