// Home page FAQ: rendered on the page and as FAQPage JSON-LD, so the two always match.
// Written as the questions a buyer (or an AI assistant on their behalf) actually asks.
import { SITE } from "./site.js";
import { SHOW_GP } from "./flags.js";

export const FAQ = [
  ["Who is behind Studio Narrm?", "Studio Narrm was founded by Pranav Gore, a Melbourne-based Solution Designer and Architect with 19 years of experience designing enterprise applications, system integrations, data analytics solutions and workflow automation across banking, telecommunications, retail and non-profit organisations."],
  ["What does Studio Narrm do?", "We design and build data dashboards, workflow automation with n8n and AI agents, custom apps and websites, and we help businesses get ready for AI search and AI agents. We do the whole job: working out what's needed, building it and handing it over."],
  ["How much does a project cost?", "Every project starts with a short call and a written plan with the scope, the timeline and, where possible, a fixed price, so you know the cost before any work begins. We'd rather start small and prove it works than sell a big project up front."],
  ["How long does a project take?", "It depends on the job. A simple AppSheet app or a single automation can be working within days. Bigger pieces of work are split into stages, so you see working parts early instead of waiting for one big reveal."],
  ["Do you work outside Melbourne?", "Yes. We're based in Melbourne and work with clients across Victoria and the rest of Australia, remotely or in person where it helps."],
  ...(SHOW_GP ? [["Do you work with GP clinics?", "Yes. We help general practices in Victoria, especially regional and rural clinics, put the My Health Record Security and Access Policy (Rule 21) in place and replace fax and email referrals with secure messaging inside the practice software they already use. Our GP clinics page has the fixed-fee package, prices and a two-minute Rule 21 self-check."]] : []),
  ["Can Studio Narrm help a small team or non-profit?", "Yes. We design and ship practical, low-maintenance solutions: self-hosted n8n data pipelines, AI agents that research and draft, low-code operational apps and dashboards that turn scattered data into decisions."],
  ["What happens after the work is handed over?", "You get documentation, a walkthrough and support while it beds in. After that we can stay on for small, regular improvements, or your team can run it themselves."],
  ["Is Studio Narrm taking on projects?", `Yes. We take on automation, data, AI agent, app, website and integration projects, including solution architecture and design engagements. Email ${SITE.email} or use the form below.`],
];

export function faqJsonLd(origin) {
  return {
    "@type": "FAQPage",
    "@id": origin + "/#faq",
    mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
}
