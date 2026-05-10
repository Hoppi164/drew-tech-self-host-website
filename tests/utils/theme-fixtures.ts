import fs from 'node:fs';
import path from 'node:path';
import type { ThemeKey } from '$lib/types/theme';

export type ThemeVariableMap = Record<string, string>;

function normalizeCssValue(value: string) {
	return value.replace(/'/g, '"').replace(/\s*,\s*/g, ',').replace(/\s+/g, ' ').trim();
}

function themeFilePath(theme: ThemeKey) {
	return path.join(process.cwd(), 'src', 'lib', 'styles', 'themes', `${theme}.css`);
}

export function readThemeVariables(theme: ThemeKey): ThemeVariableMap {
	const css = fs.readFileSync(themeFilePath(theme), 'utf8');
	const blockPattern = new RegExp(
		`\\.theme-scope\\[data-theme=['"]${theme}['"]\\]\\s*\\{([\\s\\S]*?)\\}`,
		'm'
	);
	const block = css.match(blockPattern)?.[1];

	if (!block) {
		throw new Error(`Could not find CSS block for theme "${theme}".`);
	}

	return Object.fromEntries(
		Array.from(block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g), ([, name, value]) => [
			name,
			normalizeCssValue(value)
		])
	);
}

export function expectThemeVariable(theme: ThemeKey, variableName: string) {
	const variables = readThemeVariables(theme);
	const value = variables[variableName];

	if (!value) {
		throw new Error(`Theme "${theme}" does not define "${variableName}".`);
	}

	return value;
}

export function normalizeComputedCssValue(value: string) {
	return normalizeCssValue(value);
}
