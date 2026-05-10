import { error } from '@sveltejs/kit';
import { getSiteSnapshot } from '$lib/content/server';
import { getCollection, getEvent, getGallery, getPage, getPost, resolveThemeKey } from '$lib/content/site';
import type { SiteEvent, SiteGallery, SitePage, SitePost } from '$lib/types/content';
import type { EntryGenerator, PageServerLoad } from './$types';

function isDefined<T>(value: T | undefined): value is T {
	return value !== undefined;
}

export const entries: EntryGenerator = async () => {
	const snapshot = await getSiteSnapshot();
	return snapshot.collections.map((collection) => ({ slug: collection.slug }));
};

export const load: PageServerLoad = async ({ params, parent }) => {
	const { snapshot } = await parent();
	const collection = getCollection(snapshot, params.slug);
	if (!collection) {
		throw error(404, 'Collection not found');
	}

	return {
		collection,
		pages: collection.pageSlugs.map((slug) => getPage(snapshot, slug)).filter(isDefined) as SitePage[],
		galleries: collection.gallerySlugs
			.map((slug) => getGallery(snapshot, slug))
			.filter(isDefined) as SiteGallery[],
		posts: collection.postSlugs.map((slug) => getPost(snapshot, slug)).filter(isDefined) as SitePost[],
		events: collection.eventSlugs.map((slug) => getEvent(snapshot, slug)).filter(isDefined) as SiteEvent[],
		themeKey: resolveThemeKey(snapshot, collection)
	};
};
