import type { Meta, StoryObj } from '@storybook/sveltekit';
import HomePageDemo from './HomePageDemo.svelte';
import { themeArgType } from './story-helpers';

const meta = {
	title: 'Site/HomePage',
	component: HomePageDemo,
	args: {
		theme: 'garden-journal'
	},
	argTypes: {
		theme: themeArgType
	}
} satisfies Meta<typeof HomePageDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
