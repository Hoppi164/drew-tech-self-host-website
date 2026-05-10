<script lang="ts">
	import '$lib/styles/themes/index.css';
	import type { NavigationItem, SocialLink } from '$lib/types/content';
	import type { ThemeKey } from '$lib/types/theme';
	import { withBase } from '$lib/utils/links';

	type Props = {
		theme: ThemeKey;
		siteName: string;
		tagline: string;
		navigation: NavigationItem[];
		socialLinks: SocialLink[];
		activePath?: string;
		onNavigate?: ((path: string) => void) | undefined;
		children: import('svelte').Snippet;
	};

	let { theme, siteName, tagline, navigation, socialLinks, activePath = '', onNavigate, children }: Props = $props();

	function handleNavigate(event: MouseEvent, path: string) {
		if (!onNavigate) return;
		event.preventDefault();
		onNavigate(path);
	}
</script>

<div class="shell theme-scope" data-theme={theme}>
	<header class="topbar">
		<div>
			<a class="brand" href={withBase('/')} onclick={(event) => handleNavigate(event, '/')}>{siteName}</a>
			<p>{tagline}</p>
		</div>
		<nav>
			{#each navigation as item}
				<a
					class:item-active={activePath === item.path}
					href={withBase(item.path)}
					onclick={(event) => handleNavigate(event, item.path)}
				>
					{item.label}
				</a>
			{/each}
		</nav>
	</header>

	<main>
		{@render children()}
	</main>

	<footer class="footer">
		<p>{siteName}</p>
		<div class="socials">
			{#each socialLinks as link}
				<a href={link.url} target="_blank" rel="noreferrer">{link.label}</a>
			{/each}
		</div>
	</footer>
</div>

<style>
	.shell {
		min-height: 100vh;
		background:
			var(--site-hero-glow),
			var(--site-background);
		color: var(--site-text);
		font-family: var(--site-body-font);
		transition:
			background-color 180ms ease,
			color 180ms ease;
	}

	.topbar,
	.footer,
	main {
		width: min(1120px, calc(100% - 2rem));
		margin: 0 auto;
	}

	.topbar {
		display: flex;
		gap: 1rem;
		justify-content: space-between;
		align-items: end;
		padding: 1.5rem 0 1rem;
	}

	.topbar p,
	.footer {
		color: var(--site-muted);
	}

	.brand {
		display: inline-block;
		font-family: var(--site-heading-font);
		font-size: clamp(2rem, 4vw, 3rem);
		color: var(--site-text);
		text-decoration: none;
	}

	nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	nav a,
	.socials a {
		color: var(--site-text);
		text-decoration: none;
		padding-bottom: 0.2rem;
		border-bottom: 1px solid transparent;
	}

	nav a.item-active,
	nav a:hover,
	.socials a:hover {
		border-color: currentColor;
	}

	main {
		padding-bottom: 4rem;
	}

	:global(.card),
	:global(.article),
	:global(.panel),
	:global(.hero .copy),
	:global(figure) {
		transition:
			background-color 180ms ease,
			border-color 180ms ease,
			color 180ms ease,
			box-shadow 180ms ease;
	}

	.footer {
		padding: 0 0 2rem;
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.socials {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	@media (max-width: 720px) {
		.topbar {
			align-items: start;
			flex-direction: column;
		}
	}
</style>
