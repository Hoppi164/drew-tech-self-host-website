import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import AdminPageEditor from '$lib/components/admin/AdminPageEditor.svelte';
import type { SitePage } from '$lib/types/content';

const page: SitePage = {
	title: 'Contact',
	slug: 'contact',
	excerpt: 'Get in touch',
	featuredImage: '',
	showTitle: true,
	theme: undefined,
	body: 'Contact body',
	html: '<p>Contact body</p>',
	sourcePath: 'content/pages/contact.md'
};

describe('AdminPageEditor', () => {
	it('shows and updates the page title toggle', async () => {
		const onUpdateField = vi.fn();

		render(AdminPageEditor, {
			page,
			onUpdateField,
			onUpdateSlug: vi.fn(),
			onDelete: vi.fn()
		});

		await fireEvent.click(screen.getByLabelText('Show page title'));
		expect(onUpdateField).toHaveBeenCalledWith('showTitle', false);
	});
});
