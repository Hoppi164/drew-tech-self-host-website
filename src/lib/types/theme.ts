export const themeKeys = [
	'artist-loft',
	'garden-journal',
	'artisan-bloom',
	'coastal-clarity',
	'workshop-grid',
	'midnight-press'
] as const;

export type ThemeKey = (typeof themeKeys)[number];

export type ThemeDefinition = {
	key: ThemeKey;
	name: string;
	description: string;
	heroAlign: 'start' | 'center';
	previewLabel: string;
};

export const themes: Record<ThemeKey, ThemeDefinition> = {
	'artist-loft': {
		key: 'artist-loft',
		name: 'Artist Loft',
		description: 'Warm gallery tones with layered editorial cards.',
		heroAlign: 'start',
		previewLabel: 'Warm studio'
	},
	'garden-journal': {
		key: 'garden-journal',
		name: 'Garden Journal',
		description: 'Quiet greens and airy editorial service pages.',
		heroAlign: 'center',
		previewLabel: 'Soft editorial'
	},
	'artisan-bloom': {
		key: 'artisan-bloom',
		name: 'Artisan Bloom',
		description: 'Boutique neutrals with polished calls to action.',
		heroAlign: 'start',
		previewLabel: 'Boutique rosy'
	},
	'coastal-clarity': {
		key: 'coastal-clarity',
		name: 'Coastal Clarity',
		description: 'Open, bright, and crisp for service-led businesses.',
		heroAlign: 'center',
		previewLabel: 'Bright coastal'
	},
	'workshop-grid': {
		key: 'workshop-grid',
		name: 'Workshop Grid',
		description: 'Utility-first structure with crafted industrial tone.',
		heroAlign: 'start',
		previewLabel: 'Industrial grid'
	},
	'midnight-press': {
		key: 'midnight-press',
		name: 'Midnight Press',
		description: 'Dark editorial contrast suited to arts and events.',
		heroAlign: 'start',
		previewLabel: 'Dark editorial'
	}
};

export function isThemeKey(value: string): value is ThemeKey {
	return themeKeys.includes(value as ThemeKey);
}
