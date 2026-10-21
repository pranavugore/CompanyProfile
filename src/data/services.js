// All services. Each one links to its own page.
// Keep copy at capability level: no client names, figures or internal details.
// To hide a service, set `hidden: true` here and rename its page folder in src/pages
// with a leading underscore (e.g. _video-ads) so Astro skips it. Reverse both to bring it back.
export const ALL_SERVICES = [
  {
    slug: "data-viz",
    href: "/data-viz/",
    tone: "t-data",
    art: "data",
    eyebrow: "Data analytics & visualisation",
    kicker: "Drowning in spreadsheets?",
    title: "See your numbers <i>clearly</i>",
    summary: "We pull your data out of forms, CRMs and spreadsheets into one clean model, then build the views people actually use: an everyday dashboard, or something more memorable when the story matters.",
    feats: [
      ["Dashboards", "Trends, comparisons and shares at a glance, refreshed automatically so nobody updates them by hand."],
      ["Data pipelines", "Scheduled loads from your systems into a proper database, with checks that catch bad data early."],
      ["Data stories", "Interactive charts for reports, funders and campaigns, built to explain rather than just display."],
    ],
  },
  {
    slug: "automation",
    href: "/automation/",
    tone: "t-rpa",
    art: "flow",
    eyebrow: "Automation",
    kicker: "Same task, every day, by hand?",
    title: "Automate the <i>boring</i> bits",
    summary: "Copy and paste between inboxes, spreadsheets and systems is where good people's weeks disappear. We replace it with workflows and robots that run quietly in the background and tell you when something needs a human.",
    feats: [
      ["n8n automations", "Self-hosted workflows that connect your apps, sync records, load databases and send reports on schedule."],
      ["AI agents in the flow", "Claude-powered steps that research, draft and turn messy free text into clean records, with a human check."],
      ["RPA at scale", "Bots for systems without APIs. Our founder moved a fleet of 100+ telecom robots in-house without disruption."],
    ],
    page: {
      lead: "If someone on your team does the same steps every day or every week, there is a good chance a workflow can do it for them. We design automations that are simple to understand, cheap to run and easy to hand over.",
      offer: [
        ["System-to-system sync", "Keep your CRM, accounting, forms and spreadsheets in step without anyone retyping data."],
        ["Scheduled reporting", "Weekly and monthly reports that build and send themselves."],
        ["AI agents inside workflows", "Agents that read emails, forms and documents, pull out what matters and draft the next step."],
        ["RPA for older systems", "Software robots that work through screens when a system has no API."],
        ["Migrating existing automations", "Move bots or scripts from a vendor or an old platform to something you own and control."],
        ["Monitoring and hand-over", "Alerts, retries and logs so failures are loud, plus documentation your team can run with."],
      ],
      examples: [
        ["n8n automations and AI agents", "Self-hosted · In production", "A portfolio of 50+ n8n workflows: incremental data loads from APIs into PostgreSQL, bulk migrations into a CRM, scheduled reports and funnels, and AI agents that research and draft outreach. Every workflow alerts on failure and is backed up to Git."],
        ["RPA at Telstra", "Enterprise · 100+ robots", "Took a fleet of more than 100 software robots from a vendor-run service to an in-house team, with no disruption to the business processes they support, then kept delivering new ones."],
      ],
      second: "robots",
      secondCaption: "Moving a fleet of 100+ robots from a vendor to an in-house team, without disruption.",
    },
  },
  {
    slug: "agent-ready",
    href: "/agent-ready/",
    tone: "t-flow",
    art: "agents",
    eyebrow: "Prepare your business for agents",
    kicker: "Will AI assistants recommend you?",
    title: "Get <i>agent-ready</i>",
    summary: "People now ask ChatGPT, Claude, Gemini and Perplexity what to buy and who to call, and AI agents are starting to book and order on their behalf. We make your business easy for them to find, understand and act on.",
    feats: [
      ["Be found by AI", "Structured data, llms.txt and content shaped for answer engines (AEO and GEO), not just Google."],
      ["Be usable by agents", "Clean APIs or an MCP server so agents can check stock, prices or availability and take actions safely."],
      ["Agents inside your team", "AI agents that research, draft and file work inside your own workflows, with a human review step."],
    ],
    page: {
      lead: "Search is shifting from ten blue links to a single AI answer. If your information is buried in PDFs, images and inconsistent pages, assistants will skip you or get you wrong. Getting agent-ready means tidying what you publish and opening a safe, structured door for agents to use.",
      offer: [
        ["AI visibility check", "How ChatGPT, Claude, Gemini and Perplexity describe your business today, and what's missing."],
        ["Structured data", "Schema.org markup for your organisation, services, products, FAQs and locations."],
        ["llms.txt and clean content", "A plain, machine-readable summary of who you are and what you offer."],
        ["Agent access (API or MCP)", "A controlled way for AI agents to look things up or make a booking, with limits you set."],
        ["Internal AI agents", "Agents that handle research, drafting and data extraction inside your existing tools."],
        ["Guardrails", "Clear rules on what agents can see and do, with logging and human approval where it matters."],
      ],
    },
  },
  {
    slug: "custom-apps",
    href: "/custom-apps/",
    tone: "t-apps",
    art: "apps",
    eyebrow: "Custom apps and websites",
    kicker: "Off-the-shelf doesn't quite fit?",
    title: "Apps and websites built for <i>your</i> way of working",
    summary: "From a quick AppSheet app for the team in the field to a fast, custom website or a full web platform, we design and build software around how your people actually work, and ship it quickly with AI-assisted development.",
    feats: [
      ["Quick start with AppSheet", "When speed matters, an AppSheet app on top of your existing spreadsheets can be in people's hands in days."],
      ["Full custom builds", "Web and mobile apps with logins, payments and dashboards, like Stolen Minutes, an app we're building ourselves."],
      ["Custom websites", "Fast, accessible websites that are easy to update and built to be found in search and by AI assistants."],
      ["Integration first", "Apps that talk to your existing systems instead of becoming one more silo."],
    ],
    page: {
      lead: "Sometimes the right answer is a simple app on top of a spreadsheet, sometimes a clean new website, and sometimes a proper platform. We help you pick the smallest thing that works, build it, and grow it as you learn what people really need.",
      offer: [
        ["AppSheet and low-code apps", "Forms, checklists, approvals and records for teams on phones and tablets."],
        ["Custom websites", "Business and studio websites, designed and built from scratch: fast, mobile-friendly and set up for SEO and AI search."],
        ["Customer and member portals", "Bookings, sign-ups, payments and self-service in one place."],
        ["Internal tools", "Admin screens and dashboards that replace fragile spreadsheets."],
        ["Product MVPs", "Turn an idea into a working first version you can put in front of real users."],
        ["Integrations", "Connect the app to your CRM, payments, email and data platform."],
        ["Support and iteration", "Small, regular improvements after launch, based on how it's used."],
      ],
      examples: [
        ["Stolen Minutes", "Product · In progress", "An app we're designing and building ourselves, from idea to launch: product design, the app itself, the back end and the data behind it."],
        ["AppSheet apps", "Quick implementation", "Mobile apps for field teams, volunteers and daily operations, built on top of existing spreadsheets and backed by dashboards. The fastest way to get a working tool in people's hands."],
      ],
    },
  },
  {
    slug: "video-ads",
    hidden: true,
    href: "/video-ads/",
    tone: "t-time",
    art: "video",
    eyebrow: "Video ads",
    kicker: "Need to be seen, not scrolled past?",
    title: "Short videos that <i>stop</i> the scroll",
    summary: "Short-form video ads for social and the web: script, storyboard, edit and captions, cut for every format. AI-assisted production keeps it fast and affordable, so you can test several versions instead of betting on one.",
    feats: [
      ["Script and storyboard", "A clear hook, one message and a call to action, planned before anything is produced."],
      ["Edit for every format", "Vertical, square and widescreen cuts with captions for silent viewing."],
      ["Test and learn", "Several variations, so you can see what works and put budget behind it."],
    ],
    page: {
      lead: "Most ads get scrolled past in a moment. A good short video earns attention fast, says one thing clearly and tells people what to do next. We plan, produce and edit short-form video ads, using AI tools where they make it faster and cheaper.",
      offer: [
        ["Concept and script", "The hook, the message and the call to action, written for your audience."],
        ["Storyboard", "A frame-by-frame plan you approve before production starts."],
        ["Production", "Footage, product shots, motion graphics, AI-generated visuals or voiceover, depending on the brief."],
        ["Editing and captions", "Tight edits with on-screen text and captions."],
        ["Cut-downs for each platform", "9:16 for Reels, TikTok and Shorts, 1:1 for feeds, 16:9 for YouTube and the web."],
        ["Variations for testing", "Different hooks and endings so you can find the version that performs."],
      ],
    },
  },
  {
    slug: "marketing-outreach",
    hidden: true,
    href: "/marketing-outreach/",
    tone: "t-yoga",
    art: "marketing",
    eyebrow: "Marketing & outreach",
    kicker: "Great offer, too few people know?",
    title: "Reach the <i>right</i> people",
    summary: "Finding the right partners and customers, writing to them personally, and following up on time is hard to do by hand. We build outreach systems that research, draft and schedule, with you approving what goes out.",
    feats: [
      ["Prospect research", "AI agents that find and qualify organisations and people who fit what you offer."],
      ["Personal outreach at scale", "Drafted emails that read like you wrote them, with sensible sending limits."],
      ["Follow-ups and reporting", "Timed follow-ups, reply tracking and a simple view of what's working."],
    ],
    page: {
      lead: "Good outreach is personal, well timed and persistent, which is exactly what's hard to keep up by hand. We set up the research, writing, sending and follow-up as a system you control, so it keeps going while you focus on the conversations that come back.",
      offer: [
        ["Audience and list building", "Define who you want to reach and build a clean, qualified list."],
        ["AI-assisted research", "Agents that gather the context needed to make each message relevant."],
        ["Email sequences", "Personalised first emails and timed follow-ups, sent at a safe pace."],
        ["Newsletters and campaigns", "Regular updates to your community, with sign-up forms and segments."],
        ["CRM connection", "Replies, contacts and outcomes recorded in your CRM automatically."],
        ["Results dashboard", "Who opened, replied and converted, so you know where to focus."],
      ],
    },
  },
];

// The services shown on the site: home page, nav, footer, llms.txt and JSON-LD.
export const SERVICES = ALL_SERVICES.filter((s) => !s.hidden);
export const isShown = (slug) => SERVICES.some((s) => s.slug === slug);
