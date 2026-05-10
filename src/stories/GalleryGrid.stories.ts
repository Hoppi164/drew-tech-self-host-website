import type { Meta, StoryObj } from '@storybook/sveltekit';
import GalleryGridDemo from './GalleryGridDemo.svelte';
import { themeArgType } from './story-helpers';

const meta = {
	title: 'Site/GalleryGrid',
	component: GalleryGridDemo,
	args: {
		theme: 'coastal-clarity'
	},
	argTypes: {
		theme: themeArgType
	}
} satisfies Meta<typeof GalleryGridDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
