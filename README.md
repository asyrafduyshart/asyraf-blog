# blog.asyraf.ai

Personal blog of **Asyraf**, live at [blog.asyraf.ai](https://blog.asyraf.ai).

Built with [Next.js](https://nextjs.org) (App Router), [HeroUI](https://www.heroui.com), Tailwind CSS v4, and [Sanity](https://www.sanity.io) as the headless CMS.

## Content lives in Sanity

This repository contains **only the web app**. All posts are authored and published in the hosted Sanity Studio:

> **Studio:** https://asyraf-blog.sanity.studio/

- Project ID: `1cml7kb6` · Dataset: `production`
- The app reads **published** content through Sanity's CDN (`useCdn: true`) — no token needed.
- Pages revalidate every 60 seconds, so published changes show up without a redeploy.

### Post schema (deployed in Sanity)

| Field | Type | Used for |
| --- | --- | --- |
| `title` | string | Card + fallback headline |
| `slug` | slug | URL (`/<slug>`) |
| `excerpt` | text | Card teaser + fallback subheadline/description |
| `heroHeadline` / `heroSubheadline` | string / text | Magazine hero on the post page |
| `mainImage` | image (+ `alt`) | Optional hero image + Open Graph image |
| `publishedAt` | datetime | Ordering + display date |
| `language` | string (`id` \| `en`) | Locale-aware dates, labels, `lang` attribute |
| `body` | portable text (blocks, images, `promptSnippet`, `exampleResults`) | Article body (links + bold supported) |
| `seoTitle` / `seoDescription` | string / text | `<title>` + meta description overrides |

#### Custom body blocks

- **`promptSnippet`** (`title` string, `code` text) — copyable prompt card with a "Salin prompt" / "Copy prompt" button.
- **`exampleResults`** (`title` string, `intro` text, `images[]` of image + `alt`/`caption`, min 1) — example-results gallery: responsive 2–3 column grid of 3:4 tiles with per-image captions and a click-to-expand lightbox. Runs of two or more consecutive plain `image` blocks in the body are grouped into the same gallery automatically, so older posts don't need migrating.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. The home page lists posts from Sanity; a post is available at `/7-bookmark-x-yang-layak-diingat`.

### Environment variables

Copy `.env.example` to `.env.local` if you want to override anything — the app also runs with zero configuration because the public Sanity values have safe defaults in `src/sanity/env.ts`:

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | no (defaults to `1cml7kb6`) | Sanity project id (public) |
| `NEXT_PUBLIC_SANITY_DATASET` | no (defaults to `production`) | Sanity dataset (public) |
| `SANITY_API_READ_TOKEN` | no | **Optional, for later.** Only needed if draft preview / live content is added. Server-only — never commit it. |

The Sanity API version is hard-coded to `2026-08-23` in `src/sanity/env.ts`.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (must pass before merging) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Project structure

```
src/
├── app/
│   ├── layout.tsx        # Root layout: fonts, providers, navbar, footer
│   ├── page.tsx          # Blog index (HeroUI cards)
│   ├── [slug]/page.tsx   # Post page with magazine hero + Portable Text body
│   ├── sitemap.ts        # /sitemap.xml from Sanity slugs
│   └── robots.ts         # /robots.txt
├── components/           # Navbar, theme switch, post card, Portable Text renderer
├── lib/                  # Site config, date/reading-time helpers
└── sanity/               # Client, env, image builder, GROQ queries, types
```

## Deployment

Deploy anywhere Next.js runs (e.g. Vercel). Point the `blog.asyraf.ai` domain at the deployment; no environment variables are strictly required (see table above).
