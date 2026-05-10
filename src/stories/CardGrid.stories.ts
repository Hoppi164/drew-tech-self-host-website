import type { Meta, StoryObj } from '@storybook/sveltekit';
import CardGridDemo from './CardGridDemo.svelte';
import { themeArgType } from './story-helpers';

const meta = {
	title: 'Site/CardGrid',
	component: CardGridDemo,
	args: {
		theme: 'workshop-grid'
	},
	argTypes: {
		theme: themeArgType
	}
} satisfies Meta<typeof CardGridDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
