import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import AdminPageEditor from '$lib/components/admin/AdminPageEditor.svelte';
import type { SiteConfig, SitePage } from '$lib/types/content';

const page: SitePage = {
	title: 'Contact',
	slug: 'contact',
	excerpt: 'Get in touch',
	featuredImage: '',
	theme: undefined,
	body: 'Contact body',
	html: '<p>Contact body</p>',
	sourcePath: 'content/pages/contact.md'
};

const contact: SiteConfig['contact'] = {
	title: 'Let’s plan your next project',
	intro: 'Send a note and we will reply within two business days.',
	email: 'hello@example.com',
	phone: '0400 000 000',
	address: '123 Garden Lane',
	ctaLabel: 'Email the studio',
	ctaUrl: 'mailto:hello@example.com'
};

describe('AdminPageEditor', () => {
	it('shows and updates contact panel fields for the contact page', async () => {
		const onUpdateContactField = vi.fn();

		render(AdminPageEditor, {
			page,
			contact,
			onUpdateField: vi.fn(),
			onUpdateContactField,
			onUpdateSlug: vi.fn(),
			onDelete: vi.fn()
		});

		expect(screen.getByText('Contact Panel')).toBeTruthy();

		await fireEvent.input(screen.getByLabelText('Panel Title'), {
			currentTarget: { value: 'Talk to the team' },
			target: { value: 'Talk to the team' }
		});

		expect(onUpdateContactField).toHaveBeenCalledWith('title', 'Talk to the team');
	});
});
