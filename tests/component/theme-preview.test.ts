import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import AdminWorkspace from '$lib/components/admin/AdminWorkspace.svelte';
import type { SiteSnapshot } from '$lib/types/content';
import type { ThemeKey } from '$lib/types/theme';
import { expectThemeVariable, normalizeComputedCssValue } from '../utils/theme-fixtures';

vi.mock('$lib/github/api', () => ({
	isFineGrainedPat: vi.fn((token: string) => token.startsWith('github_pat_')),
	validateToken: vi.fn(async () => ({
		default_branch: 'main',
		html_url: 'https://github.com/demo/repo',
		full_name: 'demo/repo'
	})),
	publishSnapshot: vi.fn(async () => undefined)
}));

const snapshot: SiteSnapshot = {
	site: {
		business: {
			name: 'Northwind Studio',
			tagline: 'Handmade visuals',
			description: 'Static-first demo',
			email: 'hello@example.com',
			phone: '+61 7 5555 0110',
			location: 'Brisbane',
			logoText: 'Northwind'
		},
		repo: {
			owner: 'demo',
			name: 'repo',
			branch: 'main',
			basePath: ''
		},
		socialLinks: [
			{
				label: 'Instagram',
				url: 'https://instagram.com/example'
			}
		],
		navigation: [
			{
				label: 'About',
				path: '/about'
			},
			{
				label: 'Home',
				path: '/'
			}
		],
		homepage: {
			homePageSlug: 'about'
		},
		contact: {
			title: 'Talk',
			intro: 'Intro',
			email: 'hello@example.com',
			phone: '+61 7 5555 0110',
			address: 'Brisbane',
			ctaLabel: 'Email',
			ctaUrl: 'mailto:hello@example.com'
		},
		theme: {
			global: 'artist-loft'
		},
		enabledSections: {
			collections: true
		},
		sourcePath: 'content/site.json'
	},
	pages: [
		{
			title: 'About',
			slug: 'about',
			excerpt: 'About the business',
			featuredImage: '',
			body: 'About body',
			html: '<p>About body</p>',
			sourcePath: 'content/pages/about.md'
		}
	],
	collections: [
		{
			title: 'Journal',
			slug: 'blog-posts',
			description: 'Articles',
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
		}
	],
	entries: []
};

async function renderUnlockedWorkspace(initialSnapshot: SiteSnapshot) {
	const rendered = render(AdminWorkspace, {
		initialSnapshot: JSON.parse(JSON.stringify(initialSnapshot))
	});

	await fireEvent.input(screen.getByLabelText('Github PAT'), {
		target: { value: 'github_pat_test_token' }
	});
	await fireEvent.click(screen.getByRole('button', { name: 'Log In to CMS' }));
	await screen.findByLabelText('Global Theme');

	return rendered;
}

function getPreviewShell(container: HTMLElement) {
	const shell = container.querySelector('.preview-frame .shell');
	expect(shell).toBeTruthy();
	return shell as HTMLElement;
}

function expectPreviewTheme(shell: HTMLElement, theme: ThemeKey) {
	const styles = getComputedStyle(shell);
	expect(shell.dataset.theme).toBe(theme);
	expect(normalizeComputedCssValue(styles.getPropertyValue('--site-background'))).toBe(
		expectThemeVariable(theme, '--site-background')
	);
	expect(normalizeComputedCssValue(styles.getPropertyValue('--site-heading-font'))).toBe(
		expectThemeVariable(theme, '--site-heading-font')
	);
	expect(normalizeComputedCssValue(styles.getPropertyValue('--site-radius'))).toBe(
		expectThemeVariable(theme, '--site-radius')
	);
}

describe('Admin theme preview', () => {
	it('updates the live preview styles when the global theme changes', async () => {
		const { container } = await renderUnlockedWorkspace(snapshot);

		const shell = getPreviewShell(container);
		const articleHeading = container.querySelector('.preview-frame .article h1');
		const themeSelect = screen.getByLabelText('Global Theme');

		expect(articleHeading).toBeTruthy();
		expect(themeSelect).toBeTruthy();
		expectPreviewTheme(shell, 'artist-loft');
		expect(getComputedStyle(articleHeading as HTMLElement).fontFamily).toBe(
			'var(--site-heading-font)'
		);

		await fireEvent.change(themeSelect, { target: { value: 'midnight-press' } });

		await waitFor(() => {
			expectPreviewTheme(shell, 'midnight-press');
			expect(getComputedStyle(articleHeading as HTMLElement).fontFamily).toBe(
				'var(--site-heading-font)'
			);
		});
	});

	it('updates the live preview styles when a page theme override changes', async () => {
		const { container } = await renderUnlockedWorkspace(snapshot);
		await fireEvent.click(screen.getByRole('button', { name: 'About' }));

		await screen.findByLabelText('Page Theme');

		const shell = getPreviewShell(container);
		const pageThemeSelect = screen.getByLabelText('Page Theme');

		expect(pageThemeSelect).toBeTruthy();
		expectPreviewTheme(shell, 'artist-loft');

		await fireEvent.change(pageThemeSelect, { target: { value: 'coastal-clarity' } });

		await waitFor(() => {
			expectPreviewTheme(shell, 'coastal-clarity');
		});
	});

	it('navigates within the admin preview instead of leaving the admin page', async () => {
		const { container } = await renderUnlockedWorkspace(snapshot);

		expect(screen.getByLabelText('Global Theme')).toBeTruthy();

		const previewAboutLink = container.querySelector('.preview-frame nav a[href="/about"]');
		expect(previewAboutLink).toBeTruthy();

		await fireEvent.click(previewAboutLink as HTMLAnchorElement);

		await screen.findByLabelText('Page Theme');
		expect(screen.queryByLabelText('Global Theme')).toBeNull();
		expect(screen.getByRole('button', { name: 'About' }).className).toContain('active');
	});
});
