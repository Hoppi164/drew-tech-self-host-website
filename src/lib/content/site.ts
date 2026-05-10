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

export function normalizeSlug(value: string) {
	return value
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-');
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

export function draftSourcePath(type: EditableEntityType, slug: string) {
	switch (type) {
		case 'page':
			return `content/pages/${slug}.md`;
		case 'post':
			return `content/posts/${slug}.md`;
		case 'event':
			return `content/events/${slug}.md`;
		case 'gallery':
			return `content/galleries/${slug}.json`;
		case 'collection':
			return `content/collections/${slug}.json`;
	}
}

export function insertDraftEntity(
	snapshot: SiteSnapshot,
	type: EditableEntityType,
	entity: SitePage | SitePost | SiteEvent | SiteGallery | SiteCollection,
	previous?: { slug?: string; sourcePath?: string }
) {
	switch (type) {
		case 'page':
			return { ...snapshot, pages: replaceByIdentity(snapshot.pages, entity as SitePage, previous) };
		case 'post':
			return { ...snapshot, posts: replaceByIdentity(snapshot.posts, entity as SitePost, previous) };
		case 'event':
			return { ...snapshot, events: replaceByIdentity(snapshot.events, entity as SiteEvent, previous) };
		case 'gallery':
			return {
				...snapshot,
				galleries: replaceByIdentity(snapshot.galleries, entity as SiteGallery, previous)
			};
		case 'collection':
			return {
				...snapshot,
				collections: replaceByIdentity(snapshot.collections, entity as SiteCollection, previous)
			};
	}
}

function replaceByIdentity<T extends { slug: string }>(
	items: T[],
	next: T,
	previous?: { slug?: string; sourcePath?: string }
) {
	const existingIndex = items.findIndex((item) => matchesDraftIdentity(item, next, previous));
	if (existingIndex === -1) {
		return [...items, next];
	}

	const clone = [...items];
	clone[existingIndex] = next;
	return clone;
}

function matchesDraftIdentity<T extends { slug: string }>(
	current: T,
	next: T,
	previous?: { slug?: string; sourcePath?: string }
) {
	if (previous?.sourcePath && getSourcePath(current) === previous.sourcePath) {
		return true;
	}

	if (previous?.slug && current.slug === previous.slug) {
		return true;
	}

	const currentPath = getSourcePath(current);
	const nextPath = getSourcePath(next);
	return currentPath && nextPath ? currentPath === nextPath : current.slug === next.slug;
}

function getSourcePath(value: unknown) {
	return typeof value === 'object' &&
		value !== null &&
		'sourcePath' in value &&
		typeof value.sourcePath === 'string'
		? value.sourcePath
		: undefined;
}
