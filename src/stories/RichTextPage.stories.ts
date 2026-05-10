import type { Meta, StoryObj } from '@storybook/sveltekit';
import RichTextPageDemo from './RichTextPageDemo.svelte';
import { themeArgType } from './story-helpers';

const meta = {
	title: 'Site/RichTextPage',
	component: RichTextPageDemo,
	args: {
		theme: 'midnight-press'
	},
	argTypes: {
		theme: themeArgType
	}
} satisfies Meta<typeof RichTextPageDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
