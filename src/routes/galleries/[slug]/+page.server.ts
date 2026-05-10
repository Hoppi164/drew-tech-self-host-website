import { error } from '@sveltejs/kit';
import { getSiteSnapshot } from '$lib/content/server';
import { getGallery, resolveThemeKey } from '$lib/content/site';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = async () => {
	const snapshot = await getSiteSnapshot();
	return snapshot.galleries.map((gallery) => ({ slug: gallery.slug }));
};

export const load: PageServerLoad = async ({ params, parent }) => {
	const { snapshot } = await parent();
	const gallery = getGallery(snapshot, params.slug);
	if (!gallery) {
		throw error(404, 'Gallery not found');
	}

	return {
		gallery,
		themeKey: resolveThemeKey(snapshot, gallery)
	};
};
