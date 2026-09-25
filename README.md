# Predictive Insights Studio

A client-side dashboard for exploring segment-level predictive insights (estimated ROI, confidence scores, and related metrics). Built with [Next.js](https://nextjs.org), React, and Tailwind CSS, and deployed as a fully static site to GitHub Pages.

## Getting Started

Run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app. Edit `app/page.tsx` to make changes — the page hot-reloads automatically.

> The `basePath` used for production is disabled in development, so the app is served from the root (`/`) locally and from `/predictive-insights-studio/` when deployed.

## Data Source

The dashboard fetches its data client-side from a JSON endpoint defined by `DATA_URL` in [`app/page.tsx`](app/page.tsx). To use a different dataset, update that constant to point at your own CORS-friendly URL (or drop a file in `public/` and reference it, e.g. `/segments.json`).

> **Security note:** any URL or API key placed in `DATA_URL` ships in the public client bundle. Restrict API keys (e.g. HTTP referrer restrictions) before publishing.

## Building

```bash
npm run build
```

This produces a static export in the `out/` directory (configured via `output: "export"` in [`next.config.ts`](next.config.ts)).

## Deployment (GitHub Pages)

Deployment is automated via GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)). Every push to `main` builds the static export and publishes it.

**One-time setup:** in the repository, go to **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.

Once enabled, the site is served at:

```
https://swapnadeep2k.github.io/predictive-insights-studio/
```

You can also trigger a deploy manually from the **Actions** tab (the workflow supports `workflow_dispatch`).
