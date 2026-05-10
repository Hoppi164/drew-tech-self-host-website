import type {
	NavigationItem,
	SiteCollection,
	SiteEvent,
	SiteGallery,
	SitePage,
	SitePost,
	SocialLink
} from '$lib/types/content';

export const navigation: NavigationItem[] = [
	{ label: 'Home', path: '/' },
	{ label: 'About', path: '/about' },
	{ label: 'Journal', path: '/posts' },
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
		theme: 'artist-loft',
		body: 'Body copy',
		html: '<p>Body copy</p>',
		sourcePath: 'content/pages/about.md'
	},
	{
		title: 'Services',
		slug: 'services',
		excerpt: 'A calm and practical services page.',
		featuredImage: '/uploads/garden-path.svg',
		theme: 'garden-journal',
		body: 'Body copy',
		html: '<p>Body copy</p>',
		sourcePath: 'content/pages/services.md'
	}
];

export const posts: SitePost[] = [
	{
		title: 'Spring Launch Notes',
		slug: 'spring-launch',
		excerpt: 'A sample journal entry for launch updates or announcements.',
		featuredImage: '/uploads/artist-studio.svg',
		theme: 'artist-loft',
		date: '2026-03-16',
		body: 'Post body',
		html: '<p>Post body</p>',
		sourcePath: 'content/posts/spring-launch.md'
	},
	{
		title: 'Open Day Invitations',
		slug: 'artist-open-day',
		excerpt: 'A second post to populate listing views and homepage cards.',
		featuredImage: '/uploads/contact-desk.svg',
		theme: 'artisan-bloom',
		date: '2026-04-09',
		body: 'Post body',
		html: '<p>Post body</p>',
		sourcePath: 'content/posts/artist-open-day.md'
	}
];

export const events: SiteEvent[] = [
	{
		title: 'Winter Studio Night',
		slug: 'winter-studio-night',
		excerpt: 'An example event card for exhibitions, classes, or seasonal sales.',
		featuredImage: '/uploads/artist-studio.svg',
		theme: 'midnight-press',
		date: '2026-06-21',
		location: 'West End Workshop',
		body: 'Event body',
		html: '<p>Event body</p>',
		sourcePath: 'content/events/winter-studio-night.md'
	}
];

export const gallery: SiteGallery = {
	title: 'Atelier Highlights',
	slug: 'atelier-highlights',
	description: 'A compact gallery demo.',
	coverImage: '/uploads/artist-studio.svg',
	theme: 'artist-loft',
	sourcePath: 'content/galleries/atelier-highlights.json',
	items: [
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
	]
};

export const collections: SiteCollection[] = [
	{
		title: 'Seasonal Stories',
		slug: 'seasonal-stories',
		description: 'Collections can group pages, galleries, posts, or events around a campaign or business line.',
		theme: 'coastal-clarity',
		pageSlugs: ['services'],
		gallerySlugs: ['atelier-highlights'],
		postSlugs: ['spring-launch'],
		eventSlugs: ['winter-studio-night'],
		sourcePath: 'content/collections/seasonal-stories.json'
	}
];
