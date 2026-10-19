export function GET({ site }) {
  const origin = site.href.replace(/\/$/, "");
  return new Response(`# Pranav Gore

> Pranav Gore is a Melbourne-based Solution Designer and Architect with 19 years of experience in enterprise integration, data analytics dashboards and AI agents and workflow automation (50+ production n8n workflows, ETL into PostgreSQL, LLM agents with Claude, RPA, low-code), across banking, telecommunications, retail and non-profit organisations. AWS Certified Solutions Architect – Associate.

Recent and current work: an operational analytics web app, n8n data pipelines and AI agents, Google AppSheet apps, migrating 100+ RPA robots in-house at Telstra, and two products in progress: the Stolen Minutes app and a platform for yoga teachers.

Open to Solution Architect and Solution Designer roles, and to automation, data and integration projects. Contact: pranavugore@gmail.com, https://www.linkedin.com/in/pranavugore

## Services
- [Data analytics & visualisation](${origin}/data-viz/): dashboards, data pipelines and interactive data stories, with live examples
- [Automation](${origin}/automation/): workflow automation (n8n), robotic process automation, system sync and scheduled reporting
- [Prepare your business for agents](${origin}/agent-ready/): AI visibility (AEO/GEO), structured data, llms.txt, APIs and MCP servers for AI agents, internal AI agents
- [Custom apps](${origin}/custom-apps/): AppSheet and low-code apps, web and mobile apps, portals and product MVPs
- [Video ads](${origin}/video-ads/): short-form video ads, script to edit, cut for every platform
- [Marketing & outreach](${origin}/marketing-outreach/): AI-assisted prospect research, personalised email outreach, follow-ups and reporting

## Pages
- [Home](${origin}/): overview, capabilities, skills, FAQ, contact
- [Work](${origin}/work/): case studies in AI agents, n8n data pipelines, analytics, banking integration and migration, RPA and telecom fulfilment
- [About](${origin}/about/): career timeline, certifications, education
`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
