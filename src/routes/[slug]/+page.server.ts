import { error } from '@sveltejs/kit';
import { getSiteSnapshot } from '$lib/content/server';
import { getCollectionByRouteBase, getOrderedEntries, getPage, resolveThemeKey } from '$lib/content/site';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = async () => {
	const snapshot = await getSiteSnapshot();
	return [
		...snapshot.pages.map((page) => ({ slug: page.slug })),
		...snapshot.collections.map((collection) => ({ slug: collection.routeBase }))
	];
};

export const load: PageServerLoad = async ({ params, parent }) => {
	const { snapshot } = await parent();
	const page = getPage(snapshot, params.slug);
	if (page) {
		return {
			view: 'page' as const,
			page,
			themeKey: resolveThemeKey(snapshot, page)
		};
	}

	const collection = getCollectionByRouteBase(snapshot, params.slug);
	if (!collection) {
		throw error(404, 'Page not found');
	}

	return {
		view: 'collection' as const,
		collection,
		entries: getOrderedEntries(snapshot, collection),
		themeKey: resolveThemeKey(snapshot, collection)
	};
};
