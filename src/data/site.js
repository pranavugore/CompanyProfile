import { SERVICES } from "./services.js";

export const SITE = {
  brand: "Studio Narrm",
  domain: "studionarrm.com",
  brandDescription:
    "Studio Narrm is a Melbourne studio that designs and builds data dashboards, workflow automation, AI agents, custom apps and websites, founded by solution architect Pranav Gore.",
  name: "Pranav Gore",
  givenName: "Pranav",
  familyName: "Gore",
  jobTitle: "Solution Architect",
  email: "pranavugore@gmail.com",
  linkedin: "https://www.linkedin.com/in/pranavugore",
  city: "Melbourne",
  region: "VIC",
  country: "AU",
  description:
    "Solution Designer and Architect with 19 years of experience building enterprise applications, integrations, data analytics solutions and workflow automation.",
  updated: "2026-10-22",
};

// Topics the studio works in, for knowsAbout. Keep to capabilities, not clients.
export const KNOWS_ABOUT = [
  "Solution architecture", "System integration", "Workflow automation", "n8n", "Robotic process automation",
  "AI agents", "Large language models", "Model Context Protocol", "Answer engine optimisation", "Generative engine optimisation",
  "Structured data", "Data analytics", "Data visualisation", "Dashboards", "ETL", "PostgreSQL", "Google AppSheet",
  "Low-code development", "Web development", "My Health Record Security and Access Policy", "Secure messaging for general practice",
];

// Organization node for JSON-LD, shared by every page's @graph.
export function org(origin) {
  return {
    "@type": "ProfessionalService",
    "@id": origin + "/#org",
    name: SITE.brand,
    alternateName: ["studionarrm", SITE.domain],
    url: origin + "/",
    logo: origin + "/logo.png",
    image: origin + "/og.png",
    description: SITE.brandDescription,
    email: "mailto:" + SITE.email,
    founder: { "@id": origin + "/#person" },
    address: { "@type": "PostalAddress", addressLocality: SITE.city, addressRegion: SITE.region, addressCountry: SITE.country },
    areaServed: [
      { "@type": "City", name: "Melbourne" },
      { "@type": "State", name: "Victoria" },
      { "@type": "Country", name: "Australia" },
    ],
    knowsAbout: KNOWS_ABOUT,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: SITE.email,
      url: origin + "/#contact",
      areaServed: "AU",
      availableLanguage: ["en-AU"],
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: SITE.brand + " services",
      itemListElement: SERVICES.map((sv) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: sv.eyebrow, description: sv.summary, url: origin + sv.href },
      })),
    },
    sameAs: [SITE.linkedin],
  };
}
