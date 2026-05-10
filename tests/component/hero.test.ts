import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import RichTextPage from '$lib/components/site/RichTextPage.svelte';

describe('RichTextPage', () => {
	it('renders the title and html body', () => {
		render(RichTextPage, {
			title: 'Northwind',
			excerpt: 'A strong opening statement',
			html: '<p>Rendered body</p>'
		});

		expect(screen.getByRole('heading', { name: 'Northwind' })).toBeTruthy();
		expect(screen.getByText('Rendered body')).toBeTruthy();
	});
});
