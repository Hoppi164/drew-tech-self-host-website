import { describe, expect, it } from 'vitest';
import {
	draftSourcePath,
	insertDraftEntity,
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
			featuredPageSlugs: [],
			featuredCollectionSlugs: [],
			featuredGallerySlug: '',
			featuredPostSlugs: [],
			featuredEventSlugs: [],
			heroCtaLabel: 'Contact',
			heroCtaPath: '/contact'
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
			posts: true,
			events: true,
			collections: true,
			galleries: true
		},
		sourcePath: 'content/site.json'
	},
	pages: [],
	posts: [],
	events: [],
	galleries: [],
	collections: []
};

describe('content helpers', () => {
	it('sorts dated entries descending', () => {
		const items = sortByDateDescending([
			{ date: '2026-01-01', name: 'a' },
			{ date: '2026-03-01', name: 'b' }
		]);

		expect(items[0].name).toBe('b');
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

		expect(next.pages).toHaveLength(1);
		expect(next.pages[0].slug).toBe('page');
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

		const next = insertDraftEntity(first, 'page', {
			...first.pages[0],
			slug: 'contact',
			sourcePath: draftSourcePath('page', 'contact')
		}, {
			slug: first.pages[0].slug,
			sourcePath: first.pages[0].sourcePath
		});

		expect(next.pages).toHaveLength(1);
		expect(next.pages[0].slug).toBe('contact');
		expect(next.pages[0].sourcePath).toBe('content/pages/contact.md');
	});

	it('serializes a proxied snapshot for publishing', () => {
		const proxiedSnapshot: SiteSnapshot = {
			...snapshot,
			site: new Proxy({ ...snapshot.site }, {}),
			galleries: [
				new Proxy(
					{
						title: 'Gallery',
						slug: 'gallery',
						description: 'Gallery description',
						coverImage: '/uploads/cover.jpg',
						theme: 'artist-loft',
						items: [],
						sourcePath: 'content/galleries/gallery.json'
					},
					{}
				)
			]
		};

		expect(() => serializeSnapshot(proxiedSnapshot)).not.toThrow();
	});
});
