import type { Meta, StoryObj } from '@storybook/sveltekit';
import HeroSectionDemo from './HeroSectionDemo.svelte';
import { themeArgType } from './story-helpers';

const meta = {
	title: 'Site/HeroSection',
	component: HeroSectionDemo,
	args: {
		theme: 'artist-loft'
	},
	argTypes: {
		theme: themeArgType
	}
} satisfies Meta<typeof HeroSectionDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
