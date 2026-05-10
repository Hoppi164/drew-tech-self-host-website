import { base } from '$app/paths';
import type {
	EditableEntityType,
	EntryKind,
	SiteCollection,
	SiteEntry,
	SitePage,
	SiteSnapshot
} from '$lib/types/content';
import type { PreviewSelection } from '$lib/components/admin/types';
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

export function normalizeRouteBase(value: string) {
	return normalizeSlug(value).replace(/^-+|-+$/g, '');
}

export function getPage(snapshot: SiteSnapshot, slug: string) {
	return snapshot.pages.find((page) => page.slug === slug);
}

export function getHomePage(snapshot: SiteSnapshot) {
	return getPage(snapshot, snapshot.site.homepage.homePageSlug) ?? snapshot.pages[0];
}

export function getCollection(snapshot: SiteSnapshot, slug: string) {
	return snapshot.collections.find((collection) => collection.slug === slug);
}

export function getCollectionByRouteBase(snapshot: SiteSnapshot, routeBase: string) {
	return snapshot.collections.find((collection) => collection.routeBase === routeBase);
}

export function getEntriesForCollection(snapshot: SiteSnapshot, collectionSlug: string) {
	return snapshot.entries.filter((entry) => entry.collectionSlug === collectionSlug);
}

export function getEntry(snapshot: SiteSnapshot, collectionSlug: string, slug: string) {
	return snapshot.entries.find((entry) => entry.collectionSlug === collectionSlug && entry.slug === slug);
}

export function getCollectionForEntry(snapshot: SiteSnapshot, entry: SiteEntry) {
	return getCollection(snapshot, entry.collectionSlug);
}

export function resolveThemeKey(
	snapshot: SiteSnapshot,
	item?: { theme?: ThemeKey | string | undefined | null }
) {
	return item?.theme && isThemeKey(item.theme) ? item.theme : snapshot.site.theme.global;
}

export function resolveEntryHref(snapshot: SiteSnapshot, entry: SiteEntry) {
	const collection = getCollectionForEntry(snapshot, entry);
	return collection ? `/${collection.routeBase}/${entry.slug}` : '/';
}

export function resolveCollectionHref(collection: SiteCollection) {
	return `/${collection.routeBase}`;
}

export function resolvePreviewSelectionForPath(
	snapshot: SiteSnapshot,
	pathname: string
): PreviewSelection | null {
	if (/^(https?:|mailto:|tel:|#)/.test(pathname)) {
		return null;
	}

	const normalizedPath = pathname.trim() === '' ? '/' : pathname;
	const pathWithBase = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
	const path =
		base && pathWithBase.startsWith(`${base}/`)
			? pathWithBase.slice(base.length) || '/'
			: pathWithBase === base
				? '/'
				: pathWithBase;
	const [first = '', second] = path.replace(/^\/+|\/+$/g, '').split('/');

	if (path === '/' || first === '') {
		const homePage = getHomePage(snapshot);
		return homePage ? { type: 'site', slug: 'site' } : null;
	}

	const page = getPage(snapshot, first);
	if (page && !second) {
		return { type: 'page', slug: page.slug };
	}

	const collection = getCollectionByRouteBase(snapshot, first);
	if (!collection) {
		return null;
	}

	if (!second) {
		return { type: 'collection', slug: collection.slug };
	}

	const entry = getEntry(snapshot, collection.slug, second);
	if (!entry) {
		return null;
	}

	return { type: 'entry', slug: entry.slug, collectionSlug: collection.slug };
}

export function getOrderedEntries(snapshot: SiteSnapshot, collection: SiteCollection) {
	const entries = getEntriesForCollection(snapshot, collection.slug);
	switch (collection.entryOrder) {
		case 'date-desc':
			return sortByDateDescending(
				entries.filter((entry): entry is Extract<SiteEntry, { kind: 'event' }> => 'date' in entry)
			);
		case 'title-asc':
			return [...entries].sort((left, right) => left.title.localeCompare(right.title));
		default:
			return entries;
	}
}

export function validateSnapshotRoutes(snapshot: SiteSnapshot) {
	const pageSlugs = new Set(snapshot.pages.map((page) => page.slug));
	const collectionSlugs = new Set<string>();
	const routeBases = new Set<string>();
	const errors: string[] = [];

	if (!getHomePage(snapshot)) {
		errors.push('A home page must be selected.');
	}

	for (const collection of snapshot.collections) {
		if (collectionSlugs.has(collection.slug)) {
			errors.push(`Duplicate collection slug "${collection.slug}"`);
		}
		collectionSlugs.add(collection.slug);

		if (routeBases.has(collection.routeBase)) {
			errors.push(`Duplicate route base "${collection.routeBase}"`);
		}
		routeBases.add(collection.routeBase);

		if (pageSlugs.has(collection.routeBase)) {
			errors.push(`Route base "${collection.routeBase}" conflicts with a page slug`);
		}

		const seenEntrySlugs = new Set<string>();
		for (const entry of getEntriesForCollection(snapshot, collection.slug)) {
			if (seenEntrySlugs.has(entry.slug)) {
				errors.push(`Duplicate entry slug "${entry.slug}" in collection "${collection.slug}"`);
			}
			seenEntrySlugs.add(entry.slug);
		}
	}

	return errors;
}

export function serializeSnapshot(snapshot: SiteSnapshot) {
	return {
		site: JSON.stringify(stripMeta(snapshot.site), null, 2) + '\n',
		pages: snapshot.pages.map((page) => ({
			path: page.sourcePath,
			content: serializeMarkdown(page, ['title', 'slug', 'excerpt', 'featuredImage', 'theme'])
		})),
		collections: snapshot.collections.map((collection) => ({
			path: collection.sourcePath,
			content: JSON.stringify(stripMeta(collection), null, 2) + '\n'
		})),
		entries: snapshot.entries.map((entry) => ({
			path: entry.sourcePath,
			content:
				entry.kind === 'gallery'
					? JSON.stringify(stripMeta(entry), null, 2) + '\n'
					: serializeMarkdown(
							entry,
							entry.kind === 'event'
								? [
										'title',
										'slug',
										'excerpt',
										'featuredImage',
										'theme',
										'kind',
										'collectionSlug',
										'date',
										'location',
										'tags'
									]
								: ['title', 'slug', 'excerpt', 'featuredImage', 'theme', 'kind', 'collectionSlug', 'tags']
						)
		}))
	};
}

function serializeMarkdown<T extends Record<string, unknown>>(entity: T & { body: string }, keys: string[]) {
	const frontmatter = Object.fromEntries(
		keys.flatMap((key) => {
			const value = entity[key];
			return value === undefined || value === '' || (Array.isArray(value) && value.length === 0) ? [] : [[key, value]];
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

export function updateRenderedBody<T extends SitePage | SiteEntry>(value: T): T {
	return {
		...value,
		html: renderMarkdown(value.body)
	};
}

export function draftSourcePath(type: EditableEntityType, slug: string, collectionSlug?: string, kind?: EntryKind) {
	switch (type) {
		case 'page':
			return `content/pages/${slug}.md`;
		case 'collection':
			return `content/collections/${slug}.json`;
		case 'entry':
			if (!collectionSlug || !kind) {
				throw new Error('Collection slug and entry kind are required for entry source paths.');
			}
			return `content/entries/${collectionSlug}/${slug}.${kind === 'gallery' ? 'json' : 'md'}`;
	}
}

export function insertDraftEntity(
	snapshot: SiteSnapshot,
	type: EditableEntityType,
	entity: SitePage | SiteCollection | SiteEntry,
	previous?: { slug?: string; sourcePath?: string }
) {
	switch (type) {
		case 'page':
			return { ...snapshot, pages: replaceByIdentity(snapshot.pages, entity as SitePage, previous) };
		case 'collection':
			return {
				...snapshot,
				collections: replaceByIdentity(snapshot.collections, entity as SiteCollection, previous)
			};
		case 'entry':
			return {
				...snapshot,
				entries: replaceByIdentity(snapshot.entries, entity as SiteEntry, previous)
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
