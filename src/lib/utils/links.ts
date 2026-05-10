import { base } from '$app/paths';

export function withBase(pathname: string) {
	if (/^(https?:|mailto:|tel:|#)/.test(pathname)) {
		return pathname;
	}

	const normalizedPath = pathname === '/' ? '/' : pathname.startsWith('/') ? pathname : `/${pathname}`;

	if (normalizedPath === '/') {
		return `${base}/` || '/';
	}

	return `${base}${normalizedPath}`;
}
