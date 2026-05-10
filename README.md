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
5. Update [`content/site.json`](content/site.json) with:
   - your business details
   - `repo.owner`
   - `repo.name`
   - `repo.basePath`
6. Open `/admin` on your deployed site, paste the token, edit content, preview it, and publish.

## Deployment Path

The site supports all of these:

- `jane-smith-gardening.github.io/admin`
- `hoppi164.github.io/drew-tech-self-host-website/admin`
- `billy-bob-services.com/gardening/admin`

Set the deployment path in `content/site.json`:

```json
"repo": {
  "owner": "YOUR_GITHUB_USERNAME",
  "name": "YOUR_REPOSITORY_NAME",
  "branch": "main",
  "basePath": ""
}
```

Use these rules:

- Leave `repo.basePath` as `""` if the site should live at the domain root.
  - Example: `bob-joe-gardening.com/admin`
  - Example: `jane-smith-gardening.github.io/admin`
- Set `repo.basePath` to the repo path if you are using a GitHub project site.
  - Example: `"/drew-tech-self-host-website"`
  - Result: `hoppi164.github.io/drew-tech-self-host-website/admin`
- Set `repo.basePath` to any custom subpath if the site is mounted below a larger website.
  - Example: `"/gardening"`
  - Result: `billy-bob-services.com/gardening/admin`

Examples:

- `""` -> `bob-joe-gardening.com/admin`
- `"/drew-tech-self-host-website"` -> `hoppi164.github.io/drew-tech-self-host-website/admin`
- `"/gardening"` -> `billy-bob-services.com/gardening/admin`

If `/admin` or internal links break after deployment, the first thing to check is `repo.basePath`.

## Local Commands

```bash
npm install
npm run dev
npm run check
npm run test
npm run build
npm run storybook
```

For local production-style builds with a custom path override:

```bash
BASE_PATH=/gardening npm run build
BASE_PATH= npm run build
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
