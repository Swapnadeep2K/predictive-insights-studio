# Predictive Insights Studio

A client-side dashboard for exploring segment-level predictive insights — estimated ROI, confidence scores, channel/trigger context, and use case recommendations. Styled as a reference implementation of Adobe Journey Optimizer's UI.

**Built with:** Next.js 16 · React · TypeScript · Tailwind CSS v4 · Adobe React Spectrum · Playwright

**Deployed at:** [https://swapnadeep2k.github.io/predictive-insights-studio/](https://swapnadeep2k.github.io/predictive-insights-studio/)

## Features

- **Segment explorer** — browse and switch between customer segments; each shows size, tenure, monthly spend, and upsell propensity
- **Use cases table** — sortable, filterable table of prioritised use cases with channel, trigger, ROI, and confidence badge
- **ROI detail modal** — per-use-case ROI hero, confidence score, expected lift, 95% interval, and ROI scale visualisation
- **Collapsible sidebar** — Adobe-style left nav with collapsible sections, hover-reveal scrollbar, and icon-only collapsed mode
- **Activate flow** — select use cases and activate with toast confirmation

## Prerequisites

- Node.js 20+
- npm

## Getting Started

Run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app. The page hot-reloads automatically.

> The `basePath` used for production is disabled in development, so the app is served from the root (`/`) locally and from `/predictive-insights-studio/` when deployed.

## Project structure

```
app/
├── page.tsx                     # Thin orchestrator — state, data fetching, layout
├── layout.tsx
├── globals.css
├── spectrum-provider.tsx
├── types/
│   └── index.ts                 # All TypeScript interfaces
├── lib/
│   ├── helpers.ts               # Pure functions (labels, formatting)
│   └── constants.tsx            # VIOLET token, si() icon factory, sidebar data
└── components/
    ├── ui/
    │   ├── TruncateText.tsx
    │   ├── SortArrow.tsx
    │   └── SelectDropdown.tsx
    ├── Sidebar.tsx              # Left nav with collapsible sections
    ├── AppHeader.tsx            # Top header bar
    ├── SegmentList.tsx          # Segment selector panel
    ├── SegmentSummary.tsx       # Stat cards + description
    ├── UseCasesTable.tsx        # Use cases table with sort/filter
    ├── RoiModule.tsx            # ROI hero card in modal
    └── UseCaseModal.tsx         # Use case detail dialog
e2e/
└── app.spec.ts                  # Playwright E2E tests
```

## Data Source

The dashboard fetches its data client-side from a JSON endpoint defined by `DATA_URL` in [`app/page.tsx`](app/page.tsx). To use a different dataset, update that constant to point at your own CORS-friendly URL (or drop a file in `public/` and reference it, e.g. `/segments.json`).

> **Security note:** any URL or API key placed in `DATA_URL` ships in the public client bundle. Restrict API keys (e.g. HTTP referrer restrictions) before publishing.

## Building

```bash
npm run build
```

This produces a static export in the `out/` directory (configured via `output: "export"` in [`next.config.ts`](next.config.ts)).

## E2E Tests

[Playwright](https://playwright.dev) is used for end-to-end testing. Tests cover page load, segment selection, table rendering, confidence badges, modal open/close, sidebar collapse, sort, and filter.

```bash
npx playwright test
```

Tests run against a local dev server (started automatically). Chromium only.

## Deployment (GitHub Pages)

Deployment is automated via GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)). Every push to `main` builds the static export and publishes it.

**One-time setup:** in the repository, go to **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.

Once enabled, the site deploys automatically on every push to `main`.

You can also trigger a deploy manually from the **Actions** tab (the workflow supports `workflow_dispatch`).
