# blog.asyraf.ai

Personal blog of **Asyraf**, live at [blog.asyraf.ai](https://blog.asyraf.ai).

Built with [Next.js](https://nextjs.org) (App Router), Tailwind CSS v4, and [Sanity](https://www.sanity.io) as the headless CMS.

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
| `npm run preview` | Build with OpenNext and run the Worker locally |
| `npm run deploy` | Build and deploy the Worker |
| `npm run upload` | Build and upload a Worker version without deploying |
| `npm run cf-typegen` | Generate Cloudflare binding types |

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

### Vercel

The existing Vercel deployment remains supported. `npm run build` still runs the
standard Next.js production build, and the OpenNext files do not change that
output.

### Cloudflare Workers with OpenNext

The Worker is configured in `wrangler.jsonc` with:

- an R2 incremental-cache binding for `asyraf-blog-inc-cache`;
- a Durable Object queue for time-based ISR revalidation;
- Cloudflare Images for local `public/` images; and
- a self-reference service binding used by the revalidation queue.

Sanity images are resized directly by `cdn.sanity.io` through the custom
`next/image` loader, avoiding Cloudflare Images transformations for remote
content.

Before the first remote deployment, create the cache bucket:

```bash
npx wrangler r2 bucket create asyraf-blog-inc-cache
```

Then use:

```bash
npm run preview
npm run upload
npm run deploy
```

`workers_dev` is enabled for preview deployments. No custom domain or route is
configured yet; DNS and the current Vercel project are intentionally untouched.
