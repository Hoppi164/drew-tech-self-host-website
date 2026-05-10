import { describe, expect, it } from 'vitest';
import {
	draftSourcePath,
	getHomePage,
	insertDraftEntity,
	normalizeSlug,
	resolveThemeKey,
	serializeSnapshot,
	sortByDateDescending,
	updateRenderedBody
} from '$lib/content/site';
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
		navigation: [],
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
	entries: []
};

describe('content helpers', () => {
	it('sorts dated entries descending', () => {
		const items = sortByDateDescending([
			{ date: '2026-01-01', name: 'a' },
			{ date: '2026-03-01', name: 'b' }
		]);

		expect(items[0].name).toBe('b');
	});

	it('normalizes slugs to lowercase hyphenated text', () => {
		expect(normalizeSlug('  Contact Us Page  ')).toBe('contact-us-page');
	});

	it('resolves the selected home page from site settings', () => {
		expect(getHomePage(snapshot)?.slug).toBe('about');
	});

	it('falls back to global theme', () => {
		expect(resolveThemeKey(snapshot, undefined)).toBe('artist-loft');
	});

	it('treats a blank theme override as global theme', () => {
		expect(resolveThemeKey(snapshot, { theme: '' as never })).toBe('artist-loft');
	});

	it('renders markdown when a draft body changes', () => {
		const page = updateRenderedBody({
			title: 'Page',
			slug: 'page',
			excerpt: 'Excerpt',
			featuredImage: '',
			body: 'Hello **world**',
			html: '',
			sourcePath: 'content/pages/page.md'
		});

		expect(page.html).toContain('<strong>world</strong>');
	});

	it('upserts a page into the snapshot', () => {
		const next = insertDraftEntity(snapshot, 'page', {
			title: 'Page',
			slug: 'page',
			excerpt: 'Excerpt',
			featuredImage: '',
			body: 'Body',
			html: '<p>Body</p>',
			sourcePath: 'content/pages/page.md'
		});

		expect(next.pages).toHaveLength(2);
		expect(next.pages.find((page) => page.slug === 'page')?.sourcePath).toBe('content/pages/page.md');
	});

	it('replaces a draft page when its slug changes', () => {
		const first = insertDraftEntity(snapshot, 'page', {
			title: 'Page',
			slug: 'new-page',
			excerpt: 'Excerpt',
			featuredImage: '',
			body: 'Body',
			html: '<p>Body</p>',
			sourcePath: draftSourcePath('page', 'new-page')
		});
		const draftPage = first.pages.find((page) => page.slug === 'new-page');

		const next = insertDraftEntity(
			first,
			'page',
			{
				...draftPage!,
				slug: 'contact',
				sourcePath: draftSourcePath('page', 'contact')
			},
			{
				slug: draftPage!.slug,
				sourcePath: draftPage!.sourcePath
			}
		);

		expect(next.pages).toHaveLength(2);
		expect(next.pages.find((page) => page.slug === 'contact')?.sourcePath).toBe(
			'content/pages/contact.md'
		);
		expect(next.pages.find((page) => page.slug === 'new-page')).toBeUndefined();
	});

	it('serializes a proxied snapshot for publishing', () => {
		const proxiedSnapshot: SiteSnapshot = {
			...snapshot,
			site: new Proxy({ ...snapshot.site }, {}),
			entries: [
				new Proxy(
					{
						title: 'Gallery',
						slug: 'gallery',
						excerpt: 'Gallery description',
						featuredImage: '/uploads/cover.jpg',
						theme: 'artist-loft',
						body: 'Gallery body',
						html: '<p>Gallery body</p>',
						kind: 'gallery',
						collectionSlug: 'blog-posts',
						images: [],
						sourcePath: 'content/entries/blog-posts/gallery.json'
					},
					{}
				)
			]
		};

		expect(() => serializeSnapshot(proxiedSnapshot)).not.toThrow();
	});
});
