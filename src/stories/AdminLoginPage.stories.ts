import type { Meta, StoryObj } from '@storybook/sveltekit';
import AdminLoginPageDemo from './AdminLoginPageDemo.svelte';

const meta = {
	title: 'Admin/LoginPage',
	component: AdminLoginPageDemo
} satisfies Meta<typeof AdminLoginPageDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
