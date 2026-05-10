import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import AdminSidebar from '$lib/components/admin/AdminSidebar.svelte';
import type { CollectionGroup } from '$lib/components/admin/types';
import type { SiteCollection, SitePage } from '$lib/types/content';

const pages: SitePage[] = [
	{
		title: 'About',
		slug: 'about',
		excerpt: 'About excerpt',
		featuredImage: '',
		body: 'About body',
		html: '<p>About body</p>',
		sourcePath: 'content/pages/about.md'
	}
];

const collection: SiteCollection = {
	title: 'Journal',
	slug: 'blog-posts',
	description: 'Articles',
	theme: undefined,
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
};

const collectionGroups: CollectionGroup[] = [
	{
		collection,
		entries: [
			{
				title: 'First Post',
				slug: 'first-post',
				excerpt: 'Excerpt',
				featuredImage: '',
				theme: undefined,
				body: 'Body',
				html: '<p>Body</p>',
				kind: 'article',
				collectionSlug: 'blog-posts',
				tags: [],
				sourcePath: 'content/entries/blog-posts/first-post.md'
			}
		]
	}
];

describe('AdminSidebar', () => {
	it('automatically expands the active collection accordion', () => {
		const { container } = render(AdminSidebar, {
			siteName: 'Northwind Studio',
			pages,
			collectionGroups,
			activeType: 'entry',
			activeSlug: 'first-post',
			activeCollectionSlug: 'blog-posts',
			onChoose: vi.fn(),
			onCreatePage: vi.fn(),
			onCreateCollection: vi.fn(),
			onCreateEntry: vi.fn(),
			onLogout: vi.fn()
		});

		const details = container.querySelector('.collection-accordion details');
		expect(details).toBeTruthy();
		expect((details as HTMLDetailsElement).open).toBe(true);
	});

	it('expands a collection when its summary is clicked', async () => {
		const onChoose = vi.fn();
		const { container } = render(AdminSidebar, {
			siteName: 'Northwind Studio',
			pages,
			collectionGroups,
			activeType: 'site',
			activeSlug: 'site',
			activeCollectionSlug: undefined,
			onChoose,
			onCreatePage: vi.fn(),
			onCreateCollection: vi.fn(),
			onCreateEntry: vi.fn(),
			onLogout: vi.fn()
		});

		const details = container.querySelector('.collection-accordion details') as HTMLDetailsElement;
		expect(details.open).toBe(false);

		await fireEvent.click(screen.getByText('Journal'));

		expect(details.open).toBe(true);
		expect(onChoose).toHaveBeenCalledWith('collection', 'blog-posts');
	});
});
