import matter from 'gray-matter';
import { renderMarkdown } from '$lib/utils/markdown';

export function parseMarkdownDocument(source: string) {
	const parsed = matter(source);
	return {
		frontmatter: parsed.data,
		body: parsed.content.trim(),
		html: renderMarkdown(parsed.content)
	};
}
