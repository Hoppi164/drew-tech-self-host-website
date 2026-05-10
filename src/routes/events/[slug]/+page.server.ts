import { error } from '@sveltejs/kit';
import { getSiteSnapshot } from '$lib/content/server';
import { getEvent, resolveThemeKey } from '$lib/content/site';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = async () => {
	const snapshot = await getSiteSnapshot();
	return snapshot.events.map((event) => ({ slug: event.slug }));
};

export const load: PageServerLoad = async ({ params, parent }) => {
	const { snapshot } = await parent();
	const event = getEvent(snapshot, params.slug);
	if (!event) {
		throw error(404, 'Event not found');
	}

	return {
		event,
		themeKey: resolveThemeKey(snapshot, event)
	};
};
