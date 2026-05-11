import { z } from 'zod';
import { isThemeKey, themeKeys, type ThemeKey } from '$lib/types/theme';

const imageSchema = z.object({
	src: z.string(),
	alt: z.string(),
	caption: z.string().optional().default(''),
	tags: z.array(z.string()).default([]),
	attribution: z.string().optional().default('')
});

const navigationItemSchema = z.object({
	label: z.string(),
	path: z.string()
});

const socialLinkSchema = z.object({
	label: z.string(),
	url: z.string().url()
});

const themeValueSchema = z
	.string()
	.optional()
	.refine((value) => value === undefined || isThemeKey(value), 'Invalid theme key');

export const entryKindSchema = z.enum(['article', 'event', 'gallery']);
export const collectionLayoutSchema = z.enum(['cards', 'list', 'timeline', 'gallery']);
export const entryOrderSchema = z.enum(['manual', 'date-desc', 'title-asc']);

export const siteConfigSchema = z.object({
	business: z.object({
		name: z.string(),
		tagline: z.string(),
		description: z.string(),
		email: z.string().email(),
		phone: z.string(),
		location: z.string(),
		logoText: z.string()
	}),
	repo: z.object({
		owner: z.string(),
		name: z.string(),
		branch: z.string().default('main'),
		basePath: z.string().default('')
	}),
	socialLinks: z.array(socialLinkSchema).default([]),
	navigation: z.array(navigationItemSchema).default([]),
	homepage: z.object({
		homePageSlug: z.string()
	}),
	contact: z.object({
		title: z.string(),
		intro: z.string(),
		email: z.string().email(),
		phone: z.string(),
		address: z.string(),
		ctaLabel: z.string(),
		ctaUrl: z.string()
	}),
	theme: z.object({
		global: z.enum(themeKeys)
	}),
	enabledSections: z.object({
		collections: z.boolean().default(true)
	})
});

const markdownContentSchema = z.object({
	title: z.string(),
	slug: z.string(),
	excerpt: z.string(),
	featuredImage: z.string().optional().default(''),
	theme: themeValueSchema,
	body: z.string(),
	html: z.string(),
	sourcePath: z.string()
});

export const pageSchema = markdownContentSchema.extend({
	showTitle: z.boolean().default(true)
});

export const collectionSchema = z.object({
	title: z.string(),
	slug: z.string(),
	description: z.string(),
	showTitle: z.boolean().default(true),
	theme: themeValueSchema,
	kind: entryKindSchema,
	routeBase: z.string(),
	layout: collectionLayoutSchema,
	entryOrder: entryOrderSchema.default('manual'),
	showDate: z.boolean().default(false),
	showExcerpt: z.boolean().default(true),
	showFeaturedImage: z.boolean().default(true),
	showImageGrid: z.boolean().default(false),
	showBodyPreview: z.boolean().default(true),
	sourcePath: z.string()
});

const baseEntrySchema = markdownContentSchema.extend({
	kind: entryKindSchema,
	collectionSlug: z.string(),
	showTitle: z.boolean().default(true)
});

export const articleEntrySchema = baseEntrySchema.extend({
	kind: z.literal('article'),
	tags: z.array(z.string()).default([])
});

export const eventEntrySchema = baseEntrySchema.extend({
	kind: z.literal('event'),
	date: z.string(),
	location: z.string().optional().default(''),
	tags: z.array(z.string()).default([])
});

export const galleryEntrySchema = z.object({
	title: z.string(),
	slug: z.string(),
	excerpt: z.string(),
	featuredImage: z.string().optional().default(''),
	theme: themeValueSchema,
	body: z.string(),
	html: z.string(),
	kind: z.literal('gallery'),
	collectionSlug: z.string(),
	showTitle: z.boolean().default(true),
	images: z.array(imageSchema),
	sourcePath: z.string()
});

export const entrySchema = z.discriminatedUnion('kind', [
	articleEntrySchema,
	eventEntrySchema,
	galleryEntrySchema
]);

export const siteSnapshotSchema = z.object({
	site: siteConfigSchema.extend({
		sourcePath: z.string()
	}),
	pages: z.array(pageSchema),
	collections: z.array(collectionSchema),
	entries: z.array(entrySchema)
});

export type SiteConfig = z.infer<typeof siteConfigSchema> & { sourcePath: string };
export type SitePage = z.infer<typeof pageSchema>;
export type SiteCollection = z.infer<typeof collectionSchema>;
export type SiteArticleEntry = z.infer<typeof articleEntrySchema>;
export type SiteEventEntry = z.infer<typeof eventEntrySchema>;
export type SiteGalleryEntry = z.infer<typeof galleryEntrySchema>;
export type SiteEntry = z.infer<typeof entrySchema>;
export type SiteSnapshot = z.infer<typeof siteSnapshotSchema>;
export type ImageAsset = z.infer<typeof imageSchema>;
export type NavigationItem = z.infer<typeof navigationItemSchema>;
export type SocialLink = z.infer<typeof socialLinkSchema>;
export type ContentEntity = SitePage | SiteCollection | SiteEntry;

export type EditableEntityType = 'page' | 'collection' | 'entry';
export type EntryKind = z.infer<typeof entryKindSchema>;
export type CollectionLayout = z.infer<typeof collectionLayoutSchema>;

export const emptyDrafts = {
	page: {
		title: 'New Page',
		slug: 'new-page',
		excerpt: 'Short summary',
		featuredImage: '',
		showTitle: true,
		theme: undefined,
		body: 'Start writing here.',
		html: '',
		sourcePath: 'content/pages/new-page.md'
	} satisfies SitePage,
	collection: {
		title: 'New Collection',
		slug: 'new-collection',
		description: 'Collection description',
		showTitle: true,
		theme: undefined,
		kind: 'article',
		routeBase: 'journal',
		layout: 'cards',
		entryOrder: 'date-desc',
		showDate: false,
		showExcerpt: true,
		showFeaturedImage: true,
		showImageGrid: false,
		showBodyPreview: true,
		sourcePath: 'content/collections/new-collection.json'
	} satisfies SiteCollection
};

export function createEmptyEntryDraft(collection: SiteCollection): SiteEntry {
	const base = {
		title: `New ${collection.kind === 'gallery' ? 'Gallery' : 'Entry'}`,
		slug: `new-${collection.kind}`,
		excerpt: 'Short summary',
		featuredImage: '',
		theme: undefined,
		body: 'Start writing here.',
		html: '',
		collectionSlug: collection.slug,
		showTitle: true
	};

	switch (collection.kind) {
		case 'event':
			return {
				...base,
				kind: 'event',
				date: new Date().toISOString().slice(0, 10),
				location: '',
				tags: [],
				sourcePath: `content/entries/${collection.slug}/new-event.md`
			};
		case 'gallery':
			return {
				...base,
				kind: 'gallery',
				images: [],
				sourcePath: `content/entries/${collection.slug}/new-gallery.json`
			};
		default:
			return {
				...base,
				kind: 'article',
				tags: [],
				sourcePath: `content/entries/${collection.slug}/new-article.md`
			};
	}
}

export type Themeable = { theme?: ThemeKey | undefined };
