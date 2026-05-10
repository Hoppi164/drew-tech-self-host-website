import { describe, expect, it, vi } from 'vitest';
import { isFineGrainedPat, publishSnapshot, validateToken } from '$lib/github/api';
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
	pages: [
		{
			title: 'About',
			slug: 'about',
			excerpt: 'Excerpt',
			featuredImage: '',
			body: 'About body',
			html: '<p>About body</p>',
			sourcePath: 'content/pages/about.md'
		},
		{
			title: 'Contact',
			slug: 'contact',
			excerpt: 'Excerpt',
			featuredImage: '',
			body: 'Updated contact body',
			html: '<p>Updated contact body</p>',
			sourcePath: 'content/pages/contact.md'
		}
	],
	posts: [],
	events: [],
	galleries: [],
	collections: []
};

describe('github helpers', () => {
	it('recognizes fine-grained PATs', () => {
		expect(isFineGrainedPat('github_pat_123')).toBe(true);
		expect(isFineGrainedPat('ghp_legacy')).toBe(false);
	});

	it('validates repo access through the GitHub API', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ default_branch: 'main', full_name: 'demo/repo', html_url: 'https://github.com/demo/repo' })
		});
		vi.stubGlobal('fetch', fetchMock);

		const result = await validateToken('github_pat_123', {
			owner: 'demo',
			name: 'repo',
			branch: 'main'
		});

		expect(result.default_branch).toBe('main');
		expect(fetchMock).toHaveBeenCalledOnce();
	});

	it('publishes only changed files in a single commit', async () => {
		const aboutContent = `---\ntitle: About\nslug: about\nexcerpt: Excerpt\n---\n\nAbout body\n`;
		const contactContent = `---\ntitle: Contact\nslug: contact\nexcerpt: Excerpt\n---\n\nOld contact body\n`;
		const siteContent = `{
  "business": {
    "name": "Demo",
    "tagline": "Tagline",
    "description": "Desc",
    "email": "demo@example.com",
    "phone": "123",
    "location": "Brisbane",
    "logoText": "Demo"
  },
  "repo": {
    "owner": "demo",
    "name": "repo",
    "branch": "main",
    "basePath": ""
  },
  "socialLinks": [],
  "navigation": [],
  "homepage": {
    "featuredPageSlugs": [],
    "featuredCollectionSlugs": [],
    "featuredGallerySlug": "",
    "featuredPostSlugs": [],
    "featuredEventSlugs": [],
    "heroCtaLabel": "Contact",
    "heroCtaPath": "/contact"
  },
  "contact": {
    "title": "Talk",
    "intro": "Intro",
    "email": "demo@example.com",
    "phone": "123",
    "address": "Here",
    "ctaLabel": "Email",
    "ctaUrl": "mailto:demo@example.com"
  },
  "theme": {
    "global": "artist-loft"
  },
  "enabledSections": {
    "posts": true,
    "events": true,
    "collections": true,
    "galleries": true
  }
}
`;

		const fetchMock = vi.fn(async (input: string, init?: RequestInit) => {
			if (input.endsWith('/repos/demo/repo/git/ref/heads/main')) {
				if (init?.method === 'PATCH') {
					return { ok: true, json: async () => ({ object: { sha: 'new-commit-sha' } }) };
				}

				return { ok: true, json: async () => ({ object: { sha: 'head-commit-sha' } }) };
			}

			if (input.endsWith('/repos/demo/repo/git/commits/head-commit-sha')) {
				return { ok: true, json: async () => ({ sha: 'head-commit-sha', tree: { sha: 'base-tree-sha' } }) };
			}

			if (input.includes('/contents/content/site.json')) {
				return { ok: true, json: async () => ({ content: btoa(siteContent), encoding: 'base64' }) };
			}

			if (input.includes('/contents/content/pages/about.md')) {
				return { ok: true, json: async () => ({ content: btoa(aboutContent), encoding: 'base64' }) };
			}

			if (input.includes('/contents/content/pages/contact.md')) {
				return { ok: true, json: async () => ({ content: btoa(contactContent), encoding: 'base64' }) };
			}

			if (input.endsWith('/repos/demo/repo/git/blobs')) {
				return { ok: true, json: async () => ({ sha: 'blob-contact-sha' }) };
			}

			if (input.endsWith('/repos/demo/repo/git/trees')) {
				return { ok: true, json: async () => ({ sha: 'new-tree-sha' }) };
			}

			if (input.endsWith('/repos/demo/repo/git/commits') && init?.method === 'POST') {
				return { ok: true, json: async () => ({ sha: 'new-commit-sha' }) };
			}

			throw new Error(`Unexpected fetch: ${input}`);
		});

		vi.stubGlobal('fetch', fetchMock);

		await publishSnapshot(
			'github_pat_123',
			{
				owner: 'demo',
				name: 'repo',
				branch: 'main'
			},
			snapshot,
			[]
		);

		const blobCalls = fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/git/blobs'));
		const treeCalls = fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/git/trees'));
		const commitCalls = fetchMock.mock.calls.filter(
			([url, init]) => String(url).endsWith('/git/commits') && init?.method === 'POST'
		);
		const refPatchCalls = fetchMock.mock.calls.filter(
			([url, init]) => String(url).endsWith('/git/ref/heads/main') && init?.method === 'PATCH'
		);
		const contentsPutCalls = fetchMock.mock.calls.filter(
			([url, init]) => String(url).includes('/contents/') && init?.method === 'PUT'
		);

		expect(blobCalls).toHaveLength(1);
		expect(treeCalls).toHaveLength(1);
		expect(commitCalls).toHaveLength(1);
		expect(refPatchCalls).toHaveLength(1);
		expect(contentsPutCalls).toHaveLength(0);
	});
});
