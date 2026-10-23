import { SERVICES } from "../data/services.js";
import { SITE } from "../data/site.js";
import { SHOW_GP } from "../data/flags.js";

const BLURBS = {
  "data-viz": "dashboards, data pipelines and interactive data stories, with live examples",
  automation: "workflow automation (n8n), robotic process automation, system sync and scheduled reporting",
  "agent-ready": "AI visibility (AEO/GEO), structured data, llms.txt, APIs and MCP servers for AI agents, internal AI agents",
  "custom-apps": "custom websites, AppSheet and low-code apps, web and mobile apps, portals and product MVPs",
  "video-ads": "short-form video ads, script to edit, cut for every platform",
  "marketing-outreach": "AI-assisted prospect research, personalised email outreach, follow-ups and reporting",
};

// Each link points at the page's Markdown copy (built by integrations/agent-files.mjs); the HTML page is the same URL without index.md.
export function GET({ site }) {
  const origin = site.href.replace(/\/$/, "");
  const md = (path) => `${origin}${path}index.md`;
  const services = SERVICES.map((sv) => `- [${sv.eyebrow}](${md(sv.href)}): ${BLURBS[sv.slug]}\n`).join("");
  return new Response(`# ${SITE.brand}

> ${SITE.brand} (${origin}) is a Melbourne studio that designs and builds data dashboards, workflow automation, AI agents, custom apps and websites, and helps businesses get ready for AI search and AI agents. It was founded by ${SITE.name}, a Melbourne-based Solution Designer and Architect with 19 years of experience in enterprise integration, data analytics dashboards and AI agents and workflow automation (50+ production n8n workflows, ETL into PostgreSQL, LLM agents with Claude, RPA, low-code), across banking, telecommunications, retail and non-profit organisations. AWS Certified Solutions Architect – Associate.

Last updated: ${SITE.updated}. Every page below is linked as Markdown; drop "index.md" for the HTML page.

## Who we work with

- Small businesses, teams and non-profits that want to stop doing repetitive work by hand and see their numbers clearly.
- Larger organisations that need solution architecture and design for integration, data and automation.
${SHOW_GP ? `- General practices in Victoria, especially regional and rural clinics: putting the My Health Record Security and Access Policy (Rule 21) in place, and replacing fax and email referrals with secure messaging inside their existing practice software. Fixed-fee package $3,500 + GST (up to about 10 staff), optional monthly care plan $390 + GST. Details: [GP clinics](${md("/gp-clinics/")}).
` : ""}
Based in Melbourne, Victoria, Australia. Works across Australia, remotely or in person.

## How a project works

1. Understand: a short call to learn what's needed, who it's for and what good looks like.
2. Plan: a written plan with scope, timeline and a fixed price where possible, agreed before work starts.
3. Build: working pieces early and often.
4. Hand over: documentation, a walkthrough and support while it beds in, with optional ongoing improvements.

To start: email ${SITE.email} with a line on what you're trying to do, or use the form at ${origin}/#contact. LinkedIn: ${SITE.linkedin}

Recent and current work: an operational analytics web app, n8n data pipelines and AI agents, Google AppSheet apps, migrating 100+ RPA robots in-house at Telstra, and two products in progress: the Stolen Minutes app and a platform for yoga teachers.

## Services
${services}
## Pages
- [Home](${md("/")}): overview, services, approach, FAQ, contact
- [Work](${md("/work/")}): case studies in AI agents, n8n data pipelines, analytics, banking integration and migration, RPA and telecom fulfilment
${SHOW_GP ? `- [GP clinics](${md("/gp-clinics/")}): Rule 21 and fax-free package for GP clinics, prices, Rule 21 self-check, FAQ
- [Rule 21 guide](${md("/gp-clinics/rule-21-guide/")}): plain-English guide to the My Health Record Security and Access Policy for small practices, with official sources
` : ""}- [About](${md("/about/")}): career timeline, certifications, education

## Optional
- [Full site text](${origin}/llms-full.txt): every page above as Markdown in one file
- [Sitemap](${origin}/sitemap-index.xml)
`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
