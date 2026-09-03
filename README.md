# ALL Terrain Golf Carts

Static marketing and inventory site for [allterraingolfcarts.com](https://allterraingolfcarts.com),
built with Vite + React and deployed to GitHub Pages.

There is no server. Every page is prerendered to a real `index.html` at build time,
so each URL is directly linkable, crawlable, and readable before any JavaScript runs.

---

## Quick start

```bash
npm install
npm run dev          # local dev server
npm run build        # full build, including the inventory snapshot
npm run serve        # serve dist/ exactly as GitHub Pages would
npm test             # inventory filter test suite
npm run verify       # verify the built dist/
```

## Scripts

| Script | What it does |
| --- | --- |
| `dev` | Vite dev server |
| `fetch-data` | Writes the inventory snapshot to `client/src/data/inventory.json` |
| `optimize-assets` | Derives responsive WebP/AVIF images into `client/public/img/` |
| `build` | `fetch-data` → `optimize-assets` → `vite build` → `prerender` → `generate-seo` |
| `build:site` | Same, skipping the network fetch (uses the committed snapshot) |
| `prerender` | Renders every route to `dist/<route>/index.html` |
| `generate-seo` | Writes `dist/sitemap.xml` and `dist/robots.txt` |
| `preview` / `serve` | Serve `dist/` locally with Pages-like path resolution and compression |
| `test` | Vitest suite for the filter engine |
| `verify` | Static verification of `dist/` (files, links, sitemap, JSON-LD, budgets) |
| `verify:browser` | Playwright checks: hydration, console errors, filter behaviour |

`verify:browser` needs Playwright, which is deliberately not a dependency
(it would add a browser download to every CI install):

```bash
npm i --no-save playwright && npx playwright install chromium
npm run serve &        # in another shell
npm run verify:browser
```

## Configuration

Everything site-wide lives in **`client/src/config/site.ts`**: business name, phone,
email, service area, analytics IDs, and the `sameAs` profile list. The phone number
there is the one rendered in the header, the footer, every detail page, the sticky
mobile call button, and the JSON-LD — change it once.

Two environment variables control deployment, both set in
`.github/workflows/deploy.yml`:

| Variable | Meaning |
| --- | --- |
| `BASE_PATH` | `/` for a custom domain or `<user>.github.io`; `/<repo-name>/` for a project site |
| `SITE_DOMAIN` | Bare domain written to `dist/CNAME` on every build (Pages wipes it otherwise). Empty string disables the CNAME |

Optional build secrets, only needed if you connect a live inventory feed:

| Secret | Purpose |
| --- | --- |
| `INVENTORY_FEED_URL` | JSON inventory endpoint. Unset → the snapshot is generated from the model catalog |
| `INVENTORY_FEED_TOKEN` | Bearer token for that endpoint, if it needs one |

Neither is ever read from client code. They are used only inside `script/fetch-data.ts`.

## How the content is organised

```
client/src/
  config/site.ts        NAP and site-wide identity — single source of truth
  data/
    models.ts           Model catalog: prices, colors, specs (drives everything else)
    inventory.json      Generated snapshot; committed as the build's fallback
    filterPresets.ts    Prerendered filter pages (/inventory/new/, /inventory/4x4/, …)
    guides.ts           Topic-cluster guides supporting the pillar page
    blogPosts.ts        Blog articles
    locations.ts        50 states + 14 districts/territories
    faqs.ts             FAQ content shared by the page and its FAQPage schema
  lib/inventory.ts      Filter engine: normalization, URL parsing, faceting
  seo/
    routes.ts           THE route registry — every URL, title, description, canonical
    schema.ts           JSON-LD builders
    pageSchema.ts       Route → JSON-LD graph
    head.ts             Route → head tags (prerender) and document head (client)
```

`seo/routes.ts` is the spine. The prerenderer walks it to decide what to render,
`generate-seo.ts` walks it to build the sitemap, and the running app reads it to
update the head on navigation. A page cannot be prerendered without being in the
sitemap, and a `noindex` page cannot leak into it.

## Inventory freshness

Inventory is baked into the HTML at build time, so it is only as fresh as the last
deploy. The workflow therefore rebuilds on a schedule:

- **Every 6 hours** via cron, plus on every push to `main`.
- **On demand**: Actions → *Deploy to GitHub Pages* → *Run workflow*.

`script/fetch-data.ts` fails loudly if a configured feed is unreachable, rather than
writing an empty snapshot over a good one. The last good snapshot stays committed.

## Adding inventory, guides or pages

- **A new model or color** → `client/src/data/models.ts`. The snapshot, detail pages,
  filters, sitemap and schema all follow automatically.
- **A new guide** → append to `GUIDES` in `client/src/data/guides.ts`.
- **A new filter page** → append to `FILTER_PRESETS` in `client/src/data/filterPresets.ts`.
- **A new image** → drop it in `attached_assets/` and reference it by filename;
  `optimize-assets` derives the responsive versions and the manifest entry.

## Deploying

Repository settings → **Pages** → **Source: GitHub Actions**. Push to `main` and the
workflow builds, verifies and deploys. With a custom domain, set it under Pages and
enable *Enforce HTTPS*; the build re-writes `CNAME` on every deploy so it survives.
