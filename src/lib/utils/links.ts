import { base } from '$app/paths';

export function withBase(pathname: string) {
	if (pathname === '/') {
		return `${base}/` || '/';
	}

	return `${base}${pathname}`;
}
