import type {
	EditableEntityType,
	SiteCollection,
	SiteEvent,
	SiteGallery,
	SitePage,
	SitePost,
	SiteSnapshot
} from '$lib/types/content';
import { renderMarkdown } from '$lib/utils/markdown';
import { isThemeKey, type ThemeKey } from '$lib/types/theme';

export function sortByDateDescending<T extends { date: string }>(items: T[]) {
	return [...items].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());
}

export function getPage(snapshot: SiteSnapshot, slug: string) {
	return snapshot.pages.find((page) => page.slug === slug);
}

export function getPost(snapshot: SiteSnapshot, slug: string) {
	return snapshot.posts.find((post) => post.slug === slug);
}

export function getEvent(snapshot: SiteSnapshot, slug: string) {
	return snapshot.events.find((event) => event.slug === slug);
}

export function getGallery(snapshot: SiteSnapshot, slug: string) {
	return snapshot.galleries.find((gallery) => gallery.slug === slug);
}

export function getCollection(snapshot: SiteSnapshot, slug: string) {
	return snapshot.collections.find((collection) => collection.slug === slug);
}

export function resolveThemeKey(
	snapshot: SiteSnapshot,
	item?: { theme?: ThemeKey | string | undefined | null }
) {
	return item?.theme && isThemeKey(item.theme) ? item.theme : snapshot.site.theme.global;
}

export function homepageData(snapshot: SiteSnapshot) {
	const { homepage } = snapshot.site;
	return {
		pages: snapshot.pages.filter((page) => homepage.featuredPageSlugs.includes(page.slug)),
		collections: snapshot.collections.filter((collection) =>
			homepage.featuredCollectionSlugs.includes(collection.slug)
		),
		posts: snapshot.posts.filter((post) => homepage.featuredPostSlugs.includes(post.slug)),
		events: snapshot.events.filter((event) => homepage.featuredEventSlugs.includes(event.slug)),
		gallery: snapshot.galleries.find((gallery) => gallery.slug === homepage.featuredGallerySlug)
	};
}

export function serializeSnapshot(snapshot: SiteSnapshot) {
	return {
		site: JSON.stringify(stripMeta(snapshot.site), null, 2) + '\n',
		pages: snapshot.pages.map((page) => ({
			path: page.sourcePath,
			content: serializeMarkdown(page, ['title', 'slug', 'excerpt', 'featuredImage', 'theme'])
		})),
		posts: snapshot.posts.map((post) => ({
			path: post.sourcePath,
			content: serializeMarkdown(post, ['title', 'slug', 'excerpt', 'date', 'featuredImage', 'theme'])
		})),
		events: snapshot.events.map((event) => ({
			path: event.sourcePath,
			content: serializeMarkdown(event, [
				'title',
				'slug',
				'excerpt',
				'date',
				'location',
				'featuredImage',
				'theme'
			])
		})),
		galleries: snapshot.galleries.map((gallery) => ({
			path: gallery.sourcePath,
			content: JSON.stringify(stripMeta(gallery), null, 2) + '\n'
		})),
		collections: snapshot.collections.map((collection) => ({
			path: collection.sourcePath,
			content: JSON.stringify(stripMeta(collection), null, 2) + '\n'
		}))
	};
}

function serializeMarkdown<T extends Record<string, unknown>>(entity: T & { body: string }, keys: string[]) {
	const frontmatter = Object.fromEntries(
		keys.flatMap((key) => {
			const value = entity[key];
			return value === undefined || value === '' ? [] : [[key, value]];
		})
	);
	const yaml = Object.entries(frontmatter)
		.map(([key, value]) => `${key}: ${JSON.stringify(value).replace(/^"|"$/g, '')}`)
		.join('\n');
	return `---\n${yaml}\n---\n\n${entity.body.trim()}\n`;
}

function stripMeta<T extends Record<string, unknown>>(value: T) {
	const { html: _html, sourcePath: _sourcePath, ...rest } = value as T & {
		html?: unknown;
		sourcePath?: unknown;
	};
	return rest;
}

export function updateRenderedBody<T extends SitePage | SitePost | SiteEvent>(value: T): T {
	return {
		...value,
		html: renderMarkdown(value.body)
	};
}

export function insertDraftEntity(
	snapshot: SiteSnapshot,
	type: EditableEntityType,
	entity: SitePage | SitePost | SiteEvent | SiteGallery | SiteCollection
) {
	switch (type) {
		case 'page':
			return { ...snapshot, pages: replaceBySlug(snapshot.pages, entity as SitePage) };
		case 'post':
			return { ...snapshot, posts: replaceBySlug(snapshot.posts, entity as SitePost) };
		case 'event':
			return { ...snapshot, events: replaceBySlug(snapshot.events, entity as SiteEvent) };
		case 'gallery':
			return { ...snapshot, galleries: replaceBySlug(snapshot.galleries, entity as SiteGallery) };
		case 'collection':
			return {
				...snapshot,
				collections: replaceBySlug(snapshot.collections, entity as SiteCollection)
			};
	}
}

function replaceBySlug<T extends { slug: string }>(items: T[], next: T) {
	const existingIndex = items.findIndex((item) => item.slug === next.slug);
	if (existingIndex === -1) {
		return [...items, next];
	}

	const clone = [...items];
	clone[existingIndex] = next;
	return clone;
}
