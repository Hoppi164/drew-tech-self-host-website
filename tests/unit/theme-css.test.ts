import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('theme stylesheet structure', () => {
	it('keeps all @import statements before normal CSS rules', () => {
		const cssPath = path.resolve('src/lib/styles/themes/index.css');
		const css = fs.readFileSync(cssPath, 'utf8');
		const lines = css
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean);

		const firstRuleIndex = lines.findIndex((line) => !line.startsWith('@import'));
		const firstImportAfterRuleIndex = lines.findIndex(
			(line, index) => index > firstRuleIndex && line.startsWith('@import')
		);

		expect(firstImportAfterRuleIndex).toBe(-1);
	});
});
