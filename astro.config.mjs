import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import agentFiles from "./integrations/agent-files.mjs";
import { SERVICES } from "./src/data/services.js";

// Override with SITE_URL (e.g. a *.pages.dev preview URL) if you need to.
const site = process.env.SITE_URL || "https://studionarrm.com";

export default defineConfig({
  site,
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [
    sitemap({ filter: (page) => !page.includes("/404") }),
    // Markdown copy of every page, llms-full.txt and _headers rules for them, in reading order.
    agentFiles({ order: ["/", ...SERVICES.map((s) => s.href), "/work/", "/about/"] }),
  ],
});
