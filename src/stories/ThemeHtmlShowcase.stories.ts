import type { Meta, StoryObj } from '@storybook/sveltekit';
import ThemeHtmlShowcase from './ThemeHtmlShowcase.svelte';
import { themeArgType } from './story-helpers';

const meta = {
	title: 'Themes/HTML Primitives',
	component: ThemeHtmlShowcase,
	args: {
		theme: 'artist-loft'
	},
	argTypes: {
		theme: themeArgType
	}
} satisfies Meta<typeof ThemeHtmlShowcase>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
