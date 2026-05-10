import {
	draftSourcePath,
	getEntriesForCollection,
	insertDraftEntity,
	normalizeSlug,
	resolveCollectionHref,
	resolveEntryHref,
	updateRenderedBody
} from '$lib/content/site';
import {
	createEmptyEntryDraft,
	emptyDrafts,
	type EditableEntityType,
	type ImageAsset,
	type SiteCollection,
	type SiteEntry,
	type SiteGalleryEntry,
	type SitePage,
	type SiteSnapshot
} from '$lib/types/content';

export function cloneSnapshot<T>(value: T): T {
	return JSON.parse(JSON.stringify(value)) as T;
}

export function assetFilePathFromSrc(src: string) {
	return src.startsWith('/uploads/') ? `static${src}` : null;
}

export function setSiteField(snapshot: SiteSnapshot, path: string, value: string) {
	const next = cloneSnapshot(snapshot);
	const target = next.site as Record<string, unknown>;
	const segments = path.split('.');
	let cursor: Record<string, unknown> = target;

	for (const segment of segments.slice(0, -1)) {
		cursor = cursor[segment] as Record<string, unknown>;
	}

	cursor[segments.at(-1)!] = value;
	return next;
}

export function updateNavigationItem(
	snapshot: SiteSnapshot,
	index: number,
	field: 'label' | 'path',
	value: string
) {
	return {
		...snapshot,
		site: {
			...snapshot.site,
			navigation: snapshot.site.navigation.map((item, itemIndex) =>
				itemIndex === index ? { ...item, [field]: value } : item
			)
		}
	};
}

export function addNavigationItem(snapshot: SiteSnapshot) {
	return {
		...snapshot,
		site: {
			...snapshot.site,
			navigation: [...snapshot.site.navigation, { label: 'New Link', path: '/' }]
		}
	};
}

export function moveNavigationItem(
	snapshot: SiteSnapshot,
	index: number,
	direction: -1 | 1
) {
	const nextIndex = index + direction;
	if (nextIndex < 0 || nextIndex >= snapshot.site.navigation.length) return snapshot;

	const navigation = [...snapshot.site.navigation];
	[navigation[index], navigation[nextIndex]] = [navigation[nextIndex], navigation[index]];

	return {
		...snapshot,
		site: {
			...snapshot.site,
			navigation
		}
	};
}

export function removeNavigationItem(snapshot: SiteSnapshot, index: number) {
	return {
		...snapshot,
		site: {
			...snapshot.site,
			navigation: snapshot.site.navigation.filter((_, itemIndex) => itemIndex !== index)
		}
	};
}

export function createPageSnapshot(snapshot: SiteSnapshot) {
	const page = updateRenderedBody(cloneSnapshot(emptyDrafts.page));
	const nextSnapshot = insertDraftEntity(snapshot, 'page', page);

	return {
		page,
		snapshot: {
			...nextSnapshot,
			site: {
				...nextSnapshot.site,
				homepage: {
					...nextSnapshot.site.homepage,
					homePageSlug: nextSnapshot.site.homepage.homePageSlug || page.slug
				}
			}
		}
	};
}

export function createCollectionSnapshot(snapshot: SiteSnapshot) {
	const collection = cloneSnapshot(emptyDrafts.collection);

	return {
		collection,
		snapshot: insertDraftEntity(snapshot, 'collection', collection)
	};
}

export function createEntrySnapshot(snapshot: SiteSnapshot, collection: SiteCollection) {
	const entry = updateRenderedBody(createEmptyEntryDraft(collection));

	return {
		entry,
		snapshot: insertDraftEntity(snapshot, 'entry', entry)
	};
}

export function upsertEntitySnapshot(
	snapshot: SiteSnapshot,
	type: EditableEntityType,
	entity: SitePage | SiteCollection | SiteEntry
) {
	return insertDraftEntity(snapshot, type, entity);
}

export function renamePageSnapshot(snapshot: SiteSnapshot, page: SitePage, slug: string) {
	const nextSlug = normalizeSlug(slug);
	const previousPath = `/${page.slug}`;
	const nextPath = `/${nextSlug}`;
	const next = updateRenderedBody({
		...page,
		slug: nextSlug,
		sourcePath: draftSourcePath('page', nextSlug)
	});
	const nextSnapshot = insertDraftEntity(snapshot, 'page', next, {
		slug: page.slug,
		sourcePath: page.sourcePath
	});

	return {
		slug: nextSlug,
		snapshot: {
			...nextSnapshot,
			site: {
				...nextSnapshot.site,
				navigation: replaceNavigationPath(nextSnapshot.site.navigation, previousPath, nextPath),
				homepage: {
					...nextSnapshot.site.homepage,
					homePageSlug:
						nextSnapshot.site.homepage.homePageSlug === page.slug
							? nextSlug
							: nextSnapshot.site.homepage.homePageSlug
				}
			}
		}
	};
}

export function updateCollectionRouteBaseSnapshot(
	snapshot: SiteSnapshot,
	collection: SiteCollection,
	routeBase: string
) {
	const previousPath = resolveCollectionHref(collection);
	const nextCollection = {
		...collection,
		routeBase
	};
	const nextPath = resolveCollectionHref(nextCollection);

	return {
		routeBase,
		snapshot: {
			...insertDraftEntity(snapshot, 'collection', nextCollection, {
				slug: collection.slug,
				sourcePath: collection.sourcePath
			}),
			site: {
				...snapshot.site,
				navigation: replaceNavigationPathPrefix(snapshot.site.navigation, previousPath, nextPath)
			}
		}
	};
}

export function renameCollectionSnapshot(
	snapshot: SiteSnapshot,
	collection: SiteCollection,
	slug: string
) {
	const nextSlug = normalizeSlug(slug);
	const nextCollection = {
		...collection,
		slug: nextSlug,
		sourcePath: draftSourcePath('collection', nextSlug)
	};
	const updatedEntries = snapshot.entries.map((entry) =>
		entry.collectionSlug === collection.slug
			? {
					...entry,
					collectionSlug: nextSlug,
					sourcePath: draftSourcePath('entry', entry.slug, nextSlug, entry.kind)
				}
			: entry
	);

	return {
		slug: nextSlug,
		snapshot: {
			...insertDraftEntity(snapshot, 'collection', nextCollection, {
				slug: collection.slug,
				sourcePath: collection.sourcePath
			}),
			entries: updatedEntries
		}
	};
}

export function changeCollectionKindSnapshot(
	snapshot: SiteSnapshot,
	collection: SiteCollection,
	kind: SiteCollection['kind']
) {
	const updatedEntries = snapshot.entries.map((entry) => {
		if (entry.collectionSlug !== collection.slug) return entry;

		const base = {
			title: entry.title,
			slug: entry.slug,
			excerpt: entry.excerpt,
			featuredImage: entry.featuredImage,
			theme: entry.theme,
			body: entry.body,
			html: entry.html,
			collectionSlug: entry.collectionSlug,
			sourcePath: draftSourcePath('entry', entry.slug, collection.slug, kind)
		};

		switch (kind) {
			case 'event':
				return {
					...base,
					kind: 'event' as const,
					date: 'date' in entry ? entry.date : new Date().toISOString().slice(0, 10),
					location: 'location' in entry ? entry.location : '',
					tags: 'tags' in entry ? entry.tags : []
				};
			case 'gallery':
				return {
					...base,
					kind: 'gallery' as const,
					images: entry.kind === 'gallery' ? entry.images : []
				};
			default:
				return {
					...base,
					kind: 'article' as const,
					tags: 'tags' in entry ? entry.tags : []
				};
		}
	});

	return {
		...insertDraftEntity(snapshot, 'collection', { ...collection, kind }, {
			slug: collection.slug,
			sourcePath: collection.sourcePath
		}),
		entries: updatedEntries
	};
}

export function renameEntrySnapshot(snapshot: SiteSnapshot, entry: SiteEntry, slug: string) {
	const nextSlug = normalizeSlug(slug);
	const previousPath = resolveEntryHref(snapshot, entry);
	const next = updateRenderedBody({
		...entry,
		slug: nextSlug,
		sourcePath: draftSourcePath('entry', nextSlug, entry.collectionSlug, entry.kind)
	});
	const nextPath = resolveEntryHref(snapshot, next);

	return {
		slug: nextSlug,
		snapshot: {
			...insertDraftEntity(snapshot, 'entry', next, {
				slug: entry.slug,
				sourcePath: entry.sourcePath
			}),
			site: {
				...snapshot.site,
				navigation: replaceNavigationPath(snapshot.site.navigation, previousPath, nextPath)
			}
		}
	};
}

export function updateGalleryImageSnapshot(
	entry: SiteGalleryEntry,
	index: number,
	patch: Partial<ImageAsset>
) {
	const nextImages = entry.images.map((image, imageIndex) =>
		imageIndex === index ? { ...image, ...patch } : image
	);

	return {
		images: nextImages,
		featuredImage: entry.featuredImage || nextImages[0]?.src || ''
	};
}

export function appendGalleryUploadSnapshot(
	entry: SiteGalleryEntry,
	item: ImageAsset
) {
	return {
		featuredImage: entry.featuredImage || item.src,
		images: [...entry.images, item]
	};
}

export function removePageSnapshot(snapshot: SiteSnapshot, page: SitePage) {
	const fallbackPage = snapshot.pages.find((entry) => entry.sourcePath !== page.sourcePath);

	return {
		fallbackPage,
		snapshot: {
			...snapshot,
			pages: snapshot.pages.filter((entry) => entry.sourcePath !== page.sourcePath),
			site: {
				...snapshot.site,
				homepage: {
					...snapshot.site.homepage,
					homePageSlug:
						snapshot.site.homepage.homePageSlug === page.slug
							? fallbackPage?.slug ?? ''
							: snapshot.site.homepage.homePageSlug
				}
			}
		}
	};
}

export function removeCollectionSnapshot(snapshot: SiteSnapshot, collection: SiteCollection) {
	const entries = getEntriesForCollection(snapshot, collection.slug);
	const assetDeletes = entries.flatMap((entry) =>
		entry.kind === 'gallery'
			? entry.images
					.map((image) => assetFilePathFromSrc(image.src))
					.filter((path): path is string => Boolean(path))
			: []
	);

	return {
		deletePaths: [
			collection.sourcePath,
			...entries.map((entry) => entry.sourcePath),
			...assetDeletes
		],
		snapshot: {
			...snapshot,
			collections: snapshot.collections.filter((item) => item.slug !== collection.slug),
			entries: snapshot.entries.filter((entry) => entry.collectionSlug !== collection.slug)
		}
	};
}

export function removeEntrySnapshot(snapshot: SiteSnapshot, entry: SiteEntry) {
	const assetDeletes =
		entry.kind === 'gallery'
			? entry.images
					.map((image) => assetFilePathFromSrc(image.src))
					.filter((path): path is string => Boolean(path))
			: [];

	return {
		deletePaths: [entry.sourcePath, ...assetDeletes],
		snapshot: {
			...snapshot,
			entries: snapshot.entries.filter((item) => item.sourcePath !== entry.sourcePath)
		}
	};
}

export function removeGalleryImageSnapshot(entry: SiteGalleryEntry, index: number) {
	const image = entry.images[index];
	const nextImages = entry.images.filter((_, imageIndex) => imageIndex !== index);

	return {
		image,
		deletePath: assetFilePathFromSrc(image.src),
		nextEntryPatch: {
			images: nextImages,
			featuredImage: entry.featuredImage === image.src ? nextImages[0]?.src ?? '' : entry.featuredImage
		}
	};
}

function replaceNavigationPath(
	navigation: SiteSnapshot['site']['navigation'],
	previousPath: string,
	nextPath: string
) {
	return navigation.map((item) =>
		item.path === previousPath
			? {
					...item,
					path: nextPath
				}
			: item
	);
}

function replaceNavigationPathPrefix(
	navigation: SiteSnapshot['site']['navigation'],
	previousPath: string,
	nextPath: string
) {
	return navigation.map((item) => {
		if (item.path === previousPath) {
			return {
				...item,
				path: nextPath
			};
		}

		if (item.path.startsWith(`${previousPath}/`)) {
			return {
				...item,
				path: `${nextPath}${item.path.slice(previousPath.length)}`
			};
		}

		return item;
	});
}
