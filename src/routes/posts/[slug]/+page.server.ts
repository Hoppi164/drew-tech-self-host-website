import { error } from '@sveltejs/kit';
import { getSiteSnapshot } from '$lib/content/server';
import { getPost, resolveThemeKey } from '$lib/content/site';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = async () => {
	const snapshot = await getSiteSnapshot();
	return snapshot.posts.map((post) => ({ slug: post.slug }));
};

export const load: PageServerLoad = async ({ params, parent }) => {
	const { snapshot } = await parent();
	const post = getPost(snapshot, params.slug);
	if (!post) {
		throw error(404, 'Post not found');
	}

	return {
		post,
		themeKey: resolveThemeKey(snapshot, post)
	};
};
