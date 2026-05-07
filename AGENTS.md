# AGENTS.md

## Project

This is a static Next.js Web app that converts WeChat Official Account articles into clean Markdown.

The project must be deployable to GitHub Pages.

## Deployment Target

- GitHub Pages
- Static export only
- Build output: `out/`

## Commands

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Run type check:

```bash
npm run typecheck
```

Run lint:

```bash
npm run lint
```

Build static site:

```bash
npm run build
```

## Development Rules

* This is not a CLI project.
* This is not a server-rendered app.
* Do not add `app/api`.
* Do not add Next.js API Routes.
* Do not add Server Actions.
* Do not rely on Node.js runtime for production features.
* The app must work as a static GitHub Pages deployment.
* The main product surface is a web page.
* Prefer pasted HTML and uploaded HTML as the stable conversion paths.
* URL fetching is best-effort only and may fail because of browser CORS.
* For paste-link conversion, use the optional Cloudflare Worker in `worker/`; do not add Next.js API routes.
* Do not implement login bypass, scraping circumvention, or unauthorized crawling.
* Keep modules small and testable.
* Add tests for parser and converter behavior.
* Preserve content semantics over visual styling.
* Markdown output should be clean and readable.
