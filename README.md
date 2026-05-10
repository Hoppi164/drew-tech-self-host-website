# Static Small-Business Website Template

Fork this repo to launch a low-cost small-business website with a built-in browser CMS. The public site is fully static, the content lives in Git, and admins publish updates with a fine-grained GitHub token from `/admin`.

## What It Includes

- `SvelteKit` static site
- `GitHub Pages` hosting
- `GitHub Actions` rebuilds
- browser CMS with live preview
- file-based pages, posts, events, galleries, and collections
- six CSS theme packs
- `Vitest` and `Storybook`

## Quick Setup

1. Fork the repo.
   - Repo: [github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME](https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME)
2. Open your fork’s Actions settings and enable workflows.
   - [github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/actions](https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/actions)
3. Open your fork’s Pages settings and choose GitHub Actions as the source.
   - [github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/settings/pages](https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/settings/pages)
4. Create a fine-grained personal access token for your fork.
   - [Create the token with pre-filled settings](https://github.com/settings/personal-access-tokens/new?name=self-host-website&description=token-used-to-authenticate-admin-user-on-self-hosted-website&expires_in=none&contents=write&metadata=read)
   - In `Repository access`, choose `Only select repositories` and pick your fork.
5. Update [`content/site.json`](content/site.json) with your business details and your GitHub repo owner/name.
6. Open `/admin` on your deployed site, paste the token, edit content, preview it, and publish.

## Local Commands

```bash
npm install
npm run dev
npm run check
npm run test
npm run build
npm run storybook
```

## Content

- `content/site.json`: brand, navigation, homepage, contact, theme, repo config
- `content/pages/*.md`: standard pages
- `content/posts/*.md`: blog or news posts
- `content/events/*.md`: event entries
- `content/galleries/*.json`: image galleries
- `content/collections/*.json`: grouped content sets

## Token Safety

- Use only fine-grained PATs.
- Treat the token like a password.
- The CMS keeps it in memory only.
- Refreshing the tab clears it.
