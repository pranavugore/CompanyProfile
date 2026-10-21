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

## After the first deploy

- Add the site in **Google Search Console** and **Bing Webmaster Tools**, then submit `https://<your-domain>/sitemap-index.xml`. Bing also feeds ChatGPT search and Copilot.
- Put the site URL on your LinkedIn profile and resume. Links pointing back help both search engines and AI answer engines connect the site to you.
- When you change content, update `updated` in `src/data/site.js`.
