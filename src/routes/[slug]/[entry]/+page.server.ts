import { error } from '@sveltejs/kit';
import { getCollectionByRouteBase, getEntry, resolveThemeKey } from '$lib/content/site';
import { getSiteSnapshot } from '$lib/content/server';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = async () => {
	const snapshot = await getSiteSnapshot();
	return snapshot.collections.flatMap((collection) =>
		snapshot.entries
			.filter((entry) => entry.collectionSlug === collection.slug)
			.map((entry) => ({
				slug: collection.routeBase,
				entry: entry.slug
			}))
	);
};

export const load: PageServerLoad = async ({ params, parent }) => {
	const { snapshot } = await parent();
	const collection = getCollectionByRouteBase(snapshot, params.slug);
	if (!collection) {
		throw error(404, 'Collection not found');
	}

	const entry = getEntry(snapshot, collection.slug, params.entry);
	if (!entry) {
		throw error(404, 'Entry not found');
	}

	return {
		collection,
		entry,
		themeKey: resolveThemeKey(snapshot, entry)
	};
};
