import type { Meta, StoryObj } from '@storybook/sveltekit';
import SiteShellDemo from './SiteShellDemo.svelte';
import { themeArgType } from './story-helpers';

const meta = {
	title: 'Site/SiteShell',
	component: SiteShellDemo,
	args: {
		theme: 'artist-loft'
	},
	argTypes: {
		theme: themeArgType
	}
} satisfies Meta<typeof SiteShellDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
