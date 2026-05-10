import { themeKeys } from '$lib/types/theme';

export const themeArgType = {
	control: 'select',
	options: [...themeKeys]
} as const;
