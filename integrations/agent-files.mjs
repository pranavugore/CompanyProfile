// After the build, write files for AI agents from the finished HTML, so they can never drift from the pages:
// - <page>/index.md: the page's <main> content as Markdown
// - /llms-full.txt: every page's Markdown in one file
// - _headers: per-file rules for the .md copies (content type + canonical link back to the HTML page)
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import TurndownService from "turndown";

const DROP = ["script", "style", "svg", "canvas", "button", "form", "noscript", "template", "iframe"];

async function htmlFiles(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await htmlFiles(p)));
    else if (e.name === "index.html") out.push(p);
  }
  return out;
}

const pick = (html, re) => (html.match(re) || [])[1] || "";
const unescape = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

const cls = (node) => (node.getAttribute && node.getAttribute("class")) || "";
// Decorative or interactive-only bits: anything hidden from assistive tech, the hero slider,
// breadcrumbs, step numbers and "hover here" hints (the data source notes stay).
const isNoise = (node) => node.getAttribute && (
  node.getAttribute("aria-hidden") === "true" || node.hasAttribute("hidden") ||
  /\b(slider|crumbs|n|svc-n)\b/.test(cls(node)) || (/\bhint\b/.test(cls(node)) && !/\bsrc\b/.test(cls(node))));

function toMarkdown(html, url) {
  const td = new TurndownService({ headingStyle: "atx", bulletListMarker: "-", codeBlockStyle: "fenced" });
  // addRule rules win over Turndown's built-ins, so drop noise first.
  td.addRule("noise", { filter: (node) => DROP.includes(node.nodeName.toLowerCase()) || isNoise(node), replacement: () => "" });
  // <details>: keep the question as a heading so FAQs read as Q&A.
  td.addRule("summary", { filter: "summary", replacement: (c) => `\n\n### ${c.trim()}\n\n` });
  // A heading inside a list item (cards, steps) becomes a bold lead-in.
  td.addRule("liHeading", { filter: (node) => /^H[1-6]$/.test(node.nodeName) && node.closest && node.closest("li"), replacement: (c) => ` **${c.trim()}**: ` });
  // <b>Title</b><span>Text</span> card markup: add the separator the layout shows visually.
  td.addRule("leadIn", {
    filter: (node) => ["B", "STRONG"].includes(node.nodeName) && node.nextSibling &&
      (node.nextSibling.nodeType === 1 || /^[A-Za-z0-9]/.test(node.nextSibling.textContent)),
    replacement: (c) => `**${c.trim()}**: `,
  });
  // Compact list items on one line.
  td.addRule("li", {
    filter: "li",
    replacement: (content, node) => {
      const nested = node.querySelector && node.querySelector("ul, ol");
      // "**Title**Text" from <b>Title</b><span>Text</span> card markup: add the missing separator.
      content = content.trim().replace(/^\*\*([^*]+)\*\*(?=\S)/, "**$1**: ").replace(/:\s*:/g, ":");
      content = nested ? content.replace(/\n{2,}/g, "\n").replace(/\n/g, "\n  ") : content.replace(/\s*\n+\s*/g, " ");
      const parent = node.parentNode;
      const idx = Array.prototype.indexOf.call(parent.children, node);
      const prefix = parent.nodeName === "OL" ? `${Number(parent.getAttribute("start") || 1) + idx}. ` : "- ";
      return prefix + content + "\n";
    },
  });
  const main = pick(html, /<main[^>]*>([\s\S]*?)<\/main>/);
  const origin = new URL(url).origin;
  return td.turndown(main)
    .replace(/\]\(\/(?!\/)/g, `](${origin}/`)
    .replace(/\]\(#/g, `](${url}#`)
    .replace(/\)\[/g, ") [")
    .replace(/^[ \t]+$/gm, "")
    .replace(/^ (?=\S)/gm, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function agentFiles({ order = [] } = {}) {
  let site;
  return {
    name: "agent-files",
    hooks: {
      "astro:config:done": ({ config }) => { site = config.site.replace(/\/$/, ""); },
      "astro:build:done": async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const pages = [];
        for (const file of await htmlFiles(root)) {
          const path = "/" + relative(root, file).replace(/index\.html$/, "").replace(/\\/g, "/");
          if (path.startsWith("/404")) continue;
          const html = await readFile(file, "utf8");
          const title = unescape(pick(html, /<title>([^<]*)<\/title>/));
          const description = unescape(pick(html, /<meta name="description" content="([^"]*)"/));
          const url = site + path;
          const updated = pick(html, /<meta property="og:updated_time" content="([^"]*)"/);
          const body = toMarkdown(html, url);
          const md = `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\nurl: ${url}\nupdated: ${updated}\n---\n\n${body}\n`;
          await writeFile(join(file, "..", "index.md"), md);
          pages.push({ path, url, title, md });
        }
        const rank = (p) => { const i = order.indexOf(p.path); return i === -1 ? order.length : i; };
        pages.sort((a, b) => rank(a) - rank(b) || a.path.localeCompare(b.path));

        const full = pages.map((p) => `<page url="${p.url}">\n\n${p.md}\n</page>`).join("\n\n");
        await writeFile(join(root, "llms-full.txt"), `# Studio Narrm: full site text\n\n> Every page of ${site} as Markdown, for AI assistants and agents. Summary and links: ${site}/llms.txt\n\n${full}\n`);

        const headersFile = join(root, "_headers");
        let headers = "";
        try { headers = await readFile(headersFile, "utf8"); } catch {}
        const rules = pages.map((p) => `${p.path}index.md\n  Content-Type: text/markdown; charset=utf-8\n  Link: <${p.url}>; rel="canonical"\n`).join("\n");
        await writeFile(headersFile, headers.trimEnd() + "\n\n# Markdown copies of each page (generated at build)\n" + rules);
        logger.info(`wrote ${pages.length} Markdown pages, llms-full.txt and _headers rules`);
      },
    },
  };
}
