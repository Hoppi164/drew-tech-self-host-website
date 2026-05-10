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
		featuredPageSlugs: z.array(z.string()).default([]),
		featuredCollectionSlugs: z.array(z.string()).default([]),
		featuredGallerySlug: z.string().optional().default(''),
		featuredPostSlugs: z.array(z.string()).default([]),
		featuredEventSlugs: z.array(z.string()).default([]),
		heroCtaLabel: z.string(),
		heroCtaPath: z.string()
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
		posts: z.boolean().default(true),
		events: z.boolean().default(true),
		collections: z.boolean().default(true),
		galleries: z.boolean().default(true)
	})
});

const baseFrontmatterSchema = z.object({
	title: z.string(),
	slug: z.string(),
	excerpt: z.string(),
	featuredImage: z.string().optional().default(''),
	theme: themeValueSchema
});

export const pageSchema = baseFrontmatterSchema.extend({
	body: z.string(),
	html: z.string(),
	sourcePath: z.string()
});

export const postSchema = baseFrontmatterSchema.extend({
	date: z.string(),
	body: z.string(),
	html: z.string(),
	sourcePath: z.string()
});

export const eventSchema = baseFrontmatterSchema.extend({
	date: z.string(),
	location: z.string(),
	body: z.string(),
	html: z.string(),
	sourcePath: z.string()
});

export const gallerySchema = z.object({
	title: z.string(),
	slug: z.string(),
	description: z.string(),
	coverImage: z.string(),
	theme: themeValueSchema,
	items: z.array(imageSchema),
	sourcePath: z.string()
});

export const collectionSchema = z.object({
	title: z.string(),
	slug: z.string(),
	description: z.string(),
	theme: themeValueSchema,
	pageSlugs: z.array(z.string()).default([]),
	gallerySlugs: z.array(z.string()).default([]),
	postSlugs: z.array(z.string()).default([]),
	eventSlugs: z.array(z.string()).default([]),
	sourcePath: z.string()
});

export const siteSnapshotSchema = z.object({
	site: siteConfigSchema.extend({
		sourcePath: z.string()
	}),
	pages: z.array(pageSchema),
	posts: z.array(postSchema),
	events: z.array(eventSchema),
	galleries: z.array(gallerySchema),
	collections: z.array(collectionSchema)
});

export type SiteConfig = z.infer<typeof siteConfigSchema> & { sourcePath: string };
export type SitePage = z.infer<typeof pageSchema>;
export type SitePost = z.infer<typeof postSchema>;
export type SiteEvent = z.infer<typeof eventSchema>;
export type SiteGallery = z.infer<typeof gallerySchema>;
export type SiteCollection = z.infer<typeof collectionSchema>;
export type SiteSnapshot = z.infer<typeof siteSnapshotSchema>;
export type ImageAsset = z.infer<typeof imageSchema>;
export type NavigationItem = z.infer<typeof navigationItemSchema>;
export type SocialLink = z.infer<typeof socialLinkSchema>;
export type ContentEntity = SitePage | SitePost | SiteEvent | SiteGallery | SiteCollection;

export type EditableEntityType = 'page' | 'post' | 'event' | 'gallery' | 'collection';

export const emptyDrafts = {
	page: {
		title: 'New Page',
		slug: 'new-page',
		excerpt: 'Short summary',
		featuredImage: '',
		theme: undefined,
		body: 'Start writing here.',
		html: '',
		sourcePath: 'content/pages/new-page.md'
	} satisfies SitePage,
	post: {
		title: 'New Post',
		slug: 'new-post',
		excerpt: 'Short summary',
		featuredImage: '',
		theme: undefined,
		date: new Date().toISOString().slice(0, 10),
		body: 'Start writing here.',
		html: '',
		sourcePath: 'content/posts/new-post.md'
	} satisfies SitePost,
	event: {
		title: 'New Event',
		slug: 'new-event',
		excerpt: 'Short summary',
		featuredImage: '',
		theme: undefined,
		date: new Date().toISOString().slice(0, 10),
		location: 'Venue name',
		body: 'Describe the event.',
		html: '',
		sourcePath: 'content/events/new-event.md'
	} satisfies SiteEvent,
	gallery: {
		title: 'New Gallery',
		slug: 'new-gallery',
		description: 'Gallery description',
		coverImage: '',
		theme: undefined,
		items: [],
		sourcePath: 'content/galleries/new-gallery.json'
	} satisfies SiteGallery,
	collection: {
		title: 'New Collection',
		slug: 'new-collection',
		description: 'Collection description',
		theme: undefined,
		pageSlugs: [],
		gallerySlugs: [],
		postSlugs: [],
		eventSlugs: [],
		sourcePath: 'content/collections/new-collection.json'
	} satisfies SiteCollection
};

export type Themeable = { theme?: ThemeKey | undefined };
