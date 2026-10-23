# studionarrm website

A static website built with [Astro](https://astro.build). It produces plain HTML, CSS and JS in `dist/`, so it runs on Cloudflare Pages, Vercel, Netlify or any static host.

## Run it on your computer

Install Node 22 first, then run these commands in this folder:

```bash
npm install
npm run dev       # live preview at http://localhost:4321
npm run build     # builds the production site into dist/
npm run preview   # serves the built dist/ folder
```

## Where things live

| Path | What it is |
|---|---|
| `src/data/site.js` | Name, job title, email, LinkedIn, location, last-updated date |
| `src/data/flags.js` | On/off switches. `SHOW_GP = false` hides the GP clinics offer everywhere; set it to `true` and rebuild to bring it back |
| `src/layouts/Base.astro` | Shared `<head>`: title, description, canonical, Open Graph, JSON-LD |
| `src/components/Header.astro`, `Footer.astro` | Navigation and footer, shared by every page |
| `src/pages/index.astro` | Home page |
| `src/pages/data-viz/index.astro` | Dashboard and ten interactive charts (sample data) |
| `src/pages/work/index.astro`, `about/index.astro` | Case studies, career |
| `src/pages/robots.txt.js`, `llms.txt.js` | Generated with your real domain at build time |
| `src/styles/` | `global.css` (site) and `data-viz.css` (charts page) |
| `src/components/Logo.astro` | Logo (SN mark + wordmark) as inline SVG; follows light/dark |
| `public/` | Copied as-is: favicons, share image `og.png`, `logo.png`, D3 files, chart code |

The sitemap (`sitemap-index.xml`) is generated automatically on every build.

## Deploy to Cloudflare Pages

1. Put this folder in a GitHub (or GitLab) repository.
2. In Cloudflare, open **Workers & Pages → Create → Pages → Connect to Git** and pick the repo.
3. Build settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Under **Environment variables**, add:
   - `NODE_VERSION` = `22`
   - `SITE_URL` is optional. The site assumes `https://studionarrm.com`. Set it only to build for another address, such as a `*.pages.dev` preview (no trailing slash).
5. Click **Save and Deploy**. Each push to the main branch redeploys automatically.
6. Custom domain: in the Pages project open **Custom domains → Set up a domain** and add `studionarrm.com` (and `www.studionarrm.com`).
7. Second domain: add `studionaarm.com` to Cloudflare too, then create a **Redirect Rule** (or Bulk Redirect) that sends every request on `studionaarm.com` and `www.studionaarm.com` to `https://studionarrm.com` with a 301, keeping the path. That catches the common misspelling without creating duplicate content.

## Deploy to Vercel instead

Import the repo in Vercel. It detects Astro on its own (build `npm run build`, output `dist`). Add the same `SITE_URL` environment variable.

## Let AI crawlers in (Cloudflare)

Cloudflare blocks AI crawlers by default on new domains and can swap our robots.txt for its own. Once studionarrm.com is on Cloudflare:

1. In the Cloudflare dashboard, open the domain, then **AI Crawl Control** (older dashboards: **Security → Bots**).
2. Set **Block AI bots** to **Do not block (allow)**.
3. Turn **off** "Manage your robots.txt" (or "Instruct AI bot traffic with robots.txt"), so ours is served unchanged.
4. Leave **Bot Fight Mode** off; it challenges ClaudeBot, GPTBot and PerplexityBot. Super Bot Fight Mode is fine only if "Verified bots" is set to **Allow**.
5. Under **Caching → Configuration**, turn on **Crawler Hints**. It pings search engines (IndexNow) when pages change.
6. Check: `curl -A "ClaudeBot" -sI https://studionarrm.com/` and `curl -s https://studionarrm.com/robots.txt` should give 200 and our file.

## Files for AI agents

Built automatically, nothing to maintain by hand:

- `/llms.txt`: summary and links (src/pages/llms.txt.js).
- `/<page>/index.md`: each page as Markdown, linked from the page's `<head>` (integrations/agent-files.mjs, made from the built HTML after `astro build`).
- `/llms-full.txt`: every page's Markdown in one file.
- `_headers`: security headers plus content type and canonical link for the `.md` files (public/_headers, with per-page rules appended at build). Cloudflare only; Vercel ignores it.
- The home FAQ (page and JSON-LD) comes from src/data/faq.js; the data-viz card text from src/data/viz.js.

## After the first deploy

- Add the site in **Google Search Console** and **Bing Webmaster Tools**, then submit `https://<your-domain>/sitemap-index.xml`. Bing also feeds ChatGPT search and Copilot.
- Put the site URL on your LinkedIn profile and resume. Links pointing back help both search engines and AI answer engines connect the site to you.
- When you change content, update `updated` in `src/data/site.js`. It drives the footer date, `dateModified` in the structured data and llms.txt. A page can override it with `updated="YYYY-MM-DD"` on `<Base>`.
