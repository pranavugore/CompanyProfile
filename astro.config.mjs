import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Set SITE_URL in Cloudflare Pages (Settings > Environment variables) to your real domain.
const site = process.env.SITE_URL || "https://pranavgore.pages.dev";

export default defineConfig({
  site,
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [sitemap({ filter: (page) => !page.includes("/404") })],
});
