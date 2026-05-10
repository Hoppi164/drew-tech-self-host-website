import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
	stories: ['../src/stories/**/*.stories.ts'],
	addons: [],
	framework: {
		name: '@storybook/sveltekit',
		options: {}
	}
};

export default config;
