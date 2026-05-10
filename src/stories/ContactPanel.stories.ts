import type { Meta, StoryObj } from '@storybook/sveltekit';
import ContactPanelDemo from './ContactPanelDemo.svelte';
import { themeArgType } from './story-helpers';

const meta = {
	title: 'Site/ContactPanel',
	component: ContactPanelDemo,
	args: {
		theme: 'artisan-bloom'
	},
	argTypes: {
		theme: themeArgType
	}
} satisfies Meta<typeof ContactPanelDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
