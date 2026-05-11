import type {
	NavigationItem,
	SiteCollection,
	SiteEntry,
	SiteGalleryEntry,
	SitePage,
	SocialLink
} from '$lib/types/content';

export const navigation: NavigationItem[] = [
	{ label: 'Home', path: '/' },
	{ label: 'About', path: '/about' },
	{ label: 'Journal', path: '/journal' },
	{ label: 'Contact', path: '/contact' }
];

export const socialLinks: SocialLink[] = [
	{ label: 'Instagram', url: 'https://instagram.com/example' },
	{ label: 'Pinterest', url: 'https://pinterest.com/example' }
];

export const pages: SitePage[] = [
	{
		title: 'About',
		slug: 'about',
		excerpt: 'A flexible story page for any small business.',
		featuredImage: '/uploads/artist-studio.svg',
		showTitle: true,
		theme: undefined,
		body: 'Body copy',
		html: '<p>Body copy</p>',
		sourcePath: 'content/pages/about.md'
	},
	{
		title: 'Services',
		slug: 'services',
		excerpt: 'A calm and practical services page.',
		featuredImage: '/uploads/garden-path.svg',
		showTitle: true,
		theme: undefined,
		body: 'Body copy',
		html: '<p>Body copy</p>',
		sourcePath: 'content/pages/services.md'
	}
];

export const collections: SiteCollection[] = [
	{
		title: 'Journal',
		slug: 'blog-posts',
		description: 'A default article collection for announcements, reflections, and updates.',
		showTitle: true,
		theme: undefined,
		kind: 'article',
		routeBase: 'journal',
		layout: 'cards',
		entryOrder: 'date-desc',
		showDate: true,
		showExcerpt: true,
		showFeaturedImage: true,
		showImageGrid: false,
		showBodyPreview: true,
		sourcePath: 'content/collections/blog-posts.json'
	},
	{
		title: 'Galleries',
		slug: 'image-galleries',
		description: 'A gallery collection for visual case studies and portfolio sets.',
		showTitle: true,
		theme: undefined,
		kind: 'gallery',
		routeBase: 'galleries',
		layout: 'gallery',
		entryOrder: 'manual',
		showDate: false,
		showExcerpt: true,
		showFeaturedImage: true,
		showImageGrid: true,
		showBodyPreview: false,
		sourcePath: 'content/collections/image-galleries.json'
	},
	{
		title: 'Events',
		slug: 'studio-events',
		description: 'A dated collection for workshops, launches, and open days.',
		showTitle: true,
		theme: undefined,
		kind: 'event',
		routeBase: 'events',
		layout: 'timeline',
		entryOrder: 'date-desc',
		showDate: true,
		showExcerpt: true,
		showFeaturedImage: true,
		showImageGrid: false,
		showBodyPreview: true,
		sourcePath: 'content/collections/studio-events.json'
	}
];

export const gallery: SiteGalleryEntry = {
	title: 'Atelier Highlights',
	slug: 'atelier-highlights',
	excerpt: 'A compact gallery demo.',
	featuredImage: '/uploads/artist-studio.svg',
	showTitle: true,
	theme: undefined,
	body: 'Gallery body',
	html: '<p>Gallery body</p>',
	kind: 'gallery',
	collectionSlug: 'image-galleries',
	images: [
		{
			src: '/uploads/artist-studio.svg',
			alt: 'Artist studio illustration',
			caption: 'Open shelving and a material palette.',
			tags: ['studio'],
			attribution: 'Template demo'
		},
		{
			src: '/uploads/garden-path.svg',
			alt: 'Garden path illustration',
			caption: 'A softer outdoor service mood.',
			tags: ['garden'],
			attribution: 'Template demo'
		}
	],
	sourcePath: 'content/entries/image-galleries/atelier-highlights.json'
};

export const entries: SiteEntry[] = [
	{
		title: 'Spring Launch Notes',
		slug: 'spring-launch',
		excerpt: 'A sample journal entry for launch updates or announcements.',
		featuredImage: '/uploads/artist-studio.svg',
		showTitle: true,
		theme: undefined,
		body: 'Post body',
		html: '<p>Post body</p>',
		kind: 'article',
		tags: ['launch', 'studio'],
		collectionSlug: 'blog-posts',
		sourcePath: 'content/entries/blog-posts/spring-launch.md'
	},
	{
		title: 'Open Day Invitations',
		slug: 'artist-open-day',
		excerpt: 'A second post to populate listing views and homepage cards.',
		featuredImage: '/uploads/contact-desk.svg',
		showTitle: true,
		theme: undefined,
		body: 'Post body',
		html: '<p>Post body</p>',
		kind: 'article',
		tags: ['open-day'],
		collectionSlug: 'blog-posts',
		sourcePath: 'content/entries/blog-posts/artist-open-day.md'
	},
	{
		title: 'Winter Studio Night',
		slug: 'winter-studio-night',
		excerpt: 'An example event card for exhibitions, classes, or seasonal sales.',
		featuredImage: '/uploads/artist-studio.svg',
		showTitle: true,
		theme: undefined,
		date: '2026-06-21',
		location: 'West End Workshop',
		body: 'Event body',
		html: '<p>Event body</p>',
		kind: 'event',
		tags: ['event'],
		collectionSlug: 'studio-events',
		sourcePath: 'content/entries/studio-events/winter-studio-night.md'
	},
	gallery
];
