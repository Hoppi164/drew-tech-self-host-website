import { describe, expect, it } from 'vitest';
import {
	renameEntrySnapshot,
	renamePageSnapshot,
	updateCollectionRouteBaseSnapshot
} from '$lib/components/admin/workspace/snapshot';
import type { SiteSnapshot } from '$lib/types/content';

const snapshot: SiteSnapshot = {
	site: {
		business: {
			name: 'Demo',
			tagline: 'Tagline',
			description: 'Desc',
			email: 'demo@example.com',
			phone: '123',
			location: 'Brisbane',
			logoText: 'Demo'
		},
		repo: {
			owner: 'demo',
			name: 'repo',
			branch: 'main',
			basePath: ''
		},
		socialLinks: [],
		navigation: [
			{ label: 'About', path: '/about' },
			{ label: 'Journal', path: '/journal' },
			{ label: 'Launch Post', path: '/journal/spring-launch' }
		],
		homepage: {
			homePageSlug: 'about'
		},
		contact: {
			title: 'Talk',
			intro: 'Intro',
			email: 'demo@example.com',
			phone: '123',
			address: 'Here',
			ctaLabel: 'Email',
			ctaUrl: 'mailto:demo@example.com'
		},
		theme: {
			global: 'artist-loft'
		},
		enabledSections: {
			collections: true
		},
		sourcePath: 'content/site.json'
	},
	pages: [
		{
			title: 'About',
			slug: 'about',
			excerpt: 'About excerpt',
			featuredImage: '',
			body: 'About body',
			html: '<p>About body</p>',
			sourcePath: 'content/pages/about.md'
		}
	],
	collections: [
		{
			title: 'Journal',
			slug: 'blog-posts',
			description: 'Desc',
			kind: 'article',
			routeBase: 'journal',
			layout: 'cards',
			entryOrder: 'manual',
			showDate: false,
			showExcerpt: true,
			showFeaturedImage: true,
			showImageGrid: false,
			showBodyPreview: true,
			sourcePath: 'content/collections/blog-posts.json'
		}
	],
	entries: [
		{
			title: 'Spring Launch',
			slug: 'spring-launch',
			excerpt: 'Entry excerpt',
			featuredImage: '',
			theme: undefined,
			body: 'Body',
			html: '<p>Body</p>',
			kind: 'article',
			collectionSlug: 'blog-posts',
			tags: [],
			sourcePath: 'content/entries/blog-posts/spring-launch.md'
		}
	]
};

describe('admin snapshot route syncing', () => {
	it('updates matching navigation items when a page slug changes', () => {
		const next = renamePageSnapshot(snapshot, snapshot.pages[0], 'about-us').snapshot;
		expect(next.site.navigation.find((item) => item.label === 'About')?.path).toBe('/about-us');
	});

	it('updates matching navigation items when an entry slug changes', () => {
		const next = renameEntrySnapshot(snapshot, snapshot.entries[0], 'studio-launch').snapshot;
		expect(next.site.navigation.find((item) => item.label === 'Launch Post')?.path).toBe(
			'/journal/studio-launch'
		);
	});

	it('updates matching collection and entry navigation paths when a collection route base changes', () => {
		const next = updateCollectionRouteBaseSnapshot(
			snapshot,
			snapshot.collections[0],
			updateslug('stories')
		).snapshot;
		expect(next.site.navigation.find((item) => item.label === 'Journal')?.path).toBe('/stories');
		expect(next.site.navigation.find((item) => item.label === 'Launch Post')?.path).toBe(
			'/stories/spring-launch'
		);
	});
});

function updateslug(value: string) {
	return value;
}
