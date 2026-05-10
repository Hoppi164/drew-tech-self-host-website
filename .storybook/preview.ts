import type { Preview } from '@storybook/sveltekit';

const preview: Preview = {
	parameters: {
		layout: 'fullscreen',
		backgrounds: {
			default: 'soft',
			values: [
				{ name: 'soft', value: '#f6f7fb' },
				{ name: 'paper', value: '#fbf5ed' }
			]
		}
	}
};

export default preview;
