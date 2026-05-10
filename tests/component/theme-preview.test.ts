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
				label: 'Home',
				path: '/'
			}
		],
		homepage: {
			featuredPageSlugs: ['about'],
			featuredCollectionSlugs: [],
			featuredGallerySlug: '',
			featuredPostSlugs: [],
			featuredEventSlugs: [],
			heroCtaLabel: 'Book now',
			heroCtaPath: '/contact'
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
			excerpt: 'About the business',
			featuredImage: '',
			body: 'About body',
			html: '<p>About body</p>',
			sourcePath: 'content/pages/about.md'
		}
	],
	posts: [],
	events: [],
	galleries: [],
	collections: []
};

async function renderUnlockedWorkspace(initialSnapshot: SiteSnapshot) {
	const rendered = render(AdminWorkspace, {
		initialSnapshot: JSON.parse(JSON.stringify(initialSnapshot))
	});

	await fireEvent.input(screen.getByLabelText('Fine-grained GitHub PAT'), {
		target: { value: 'github_pat_test_token' }
	});
	await fireEvent.click(screen.getByRole('button', { name: 'Log In to CMS' }));
	await screen.findByRole('heading', { name: 'Site Settings' });

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
		const heroHeading = container.querySelector('.preview-frame .hero h1');
		const themeSelect = screen.getByLabelText('Global Theme');

		expect(heroHeading).toBeTruthy();
		expect(themeSelect).toBeTruthy();
		expectPreviewTheme(shell, 'artist-loft');
		expect(getComputedStyle(heroHeading as HTMLElement).fontFamily).toBe('var(--site-heading-font)');

		await fireEvent.change(themeSelect, { target: { value: 'midnight-press' } });

		await waitFor(() => {
			expectPreviewTheme(shell, 'midnight-press');
			expect(getComputedStyle(heroHeading as HTMLElement).fontFamily).toBe('var(--site-heading-font)');
		});
	});

	it('updates the live preview styles when a page theme override changes', async () => {
		const { container } = await renderUnlockedWorkspace(snapshot);
		await fireEvent.click(screen.getByRole('button', { name: 'About' }));

		await screen.findByRole('heading', { name: 'about' });

		const shell = getPreviewShell(container);
		const pageThemeSelect = screen.getByLabelText('Page Theme');

		expect(pageThemeSelect).toBeTruthy();
		expectPreviewTheme(shell, 'artist-loft');

		await fireEvent.change(pageThemeSelect, { target: { value: 'coastal-clarity' } });

		await waitFor(() => {
			expectPreviewTheme(shell, 'coastal-clarity');
		});
	});
});
