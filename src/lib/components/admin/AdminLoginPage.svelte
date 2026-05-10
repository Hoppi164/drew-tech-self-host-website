<script lang="ts">
	import AccordionPanel from '$lib/components/admin/AccordionPanel.svelte';
	import InfoMarker from '$lib/components/admin/InfoMarker.svelte';
	import type { GithubLinks } from '$lib/components/admin/types';

	type Props = {
		token: string;
		error: string;
		status: string;
		githubLinks: GithubLinks;
		onTokenChange: (value: string) => void;
		onSubmit: () => void;
	};

	let { token, error, status, githubLinks, onTokenChange, onSubmit }: Props = $props();
</script>

<section class="login-screen">
	<div class="login-card">
		<div class="login-copy">
			<h1 class="login-title">Admin Login</h1>
			<p>
				Use a GitHub personal access token for this repository to sign in and publish site
				changes.
			</p>
			<p>
				The token stays in this browser tab and is only used for GitHub API requests.
			</p>
		</div>

		<label>
			<span class="field-label">
				Github PAT
				<InfoMarker
					label="What is a Github PAT?"
					href={githubLinks.token}
					hrefLabel="Open GitHub PAT setup"
				>
					{#snippet children()}
						A GitHub PAT is a personal access token. Create a fine-grained token, choose
						Only select repositories, pick this fork, and grant Metadata read plus Contents
						write.
					{/snippet}
				</InfoMarker>
			</span>
			<input
				aria-label="Github PAT"
				oninput={(event) => onTokenChange((event.currentTarget as HTMLInputElement).value)}
				placeholder="github_pat_..."
				type="password"
				value={token}
			/>
		</label>

		<button class="primary login-button" onclick={onSubmit} type="button">
			Log In to CMS
			<span aria-hidden="true">→</span>
		</button>

		{#if error}<p class="status-inline error">{error}</p>{/if}
		{#if status}<p class="status-inline">{status}</p>{/if}

		<AccordionPanel summary="First time setting this up?">
			<div class="setup-help">
				<p>
					Create a GitHub account, fork the repo, enable GitHub Pages and Actions, then create a
					fine-grained PAT for that fork.
				</p>
				<p>In Repository access, choose Only select repositories and pick your fork.</p>
				<p><a href={githubLinks.repo} rel="noreferrer" target="_blank">Repository</a></p>
				<p><a href={githubLinks.actions} rel="noreferrer" target="_blank">GitHub Actions</a></p>
				<p><a href={githubLinks.pages} rel="noreferrer" target="_blank">GitHub Pages</a></p>
				<p><a href={githubLinks.token} rel="noreferrer" target="_blank">Create GitHub PAT</a></p>
			</div>
		</AccordionPanel>
	</div>
</section>

<style>
	.login-screen {
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 2rem;
		background:
			radial-gradient(circle at top left, rgba(90, 132, 210, 0.14), transparent 35%),
			linear-gradient(180deg, #f8fbff 0%, #eef3f8 100%);
	}

	.login-card {
		width: min(36rem, 100%);
		padding: 2rem;
		background: rgba(255, 255, 255, 0.92);
		backdrop-filter: blur(14px);
		border: 1px solid #d9deea;
		border-radius: 30px;
		box-shadow: 0 30px 80px rgba(25, 39, 58, 0.12);
	}

	.login-copy {
		margin-bottom: 1rem;
	}

	.login-copy p,
	.setup-help p,
	.status-inline {
		color: #617086;
	}

	.login-title {
		font-family: Georgia, serif;
		font-size: clamp(1.2rem, 2.1vw, 1.65rem);
		letter-spacing: 0.02em;
		color: #11161d;
		line-height: 1.05;
		margin: 0 0 0.75rem;
	}

	.field-label {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
	}

	label {
		display: grid;
		gap: 0.35rem;
		margin-bottom: 0.9rem;
		font-weight: 600;
	}

	input,
	button {
		font: inherit;
	}

	input {
		padding: 0.85rem 0.95rem;
		border-radius: 16px;
		border: 1px solid #cfd8e7;
		background: white;
		color: #1c2430;
	}

	button {
		border: 0;
		border-radius: 999px;
		padding: 0.85rem 1.15rem;
		cursor: pointer;
	}

	button.primary {
		background: #1f3046;
		color: white;
	}

	button.login-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		margin-bottom: 1rem;
	}

	.error {
		color: #9f2435;
	}

	a {
		color: #1e4d8c;
	}
</style>
