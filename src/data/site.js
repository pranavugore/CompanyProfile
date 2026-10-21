export const SITE = {
  brand: "studionarrm",
  brandDescription:
    "studionarrm is a Melbourne studio that designs and builds data dashboards, workflow automation, AI agents and custom apps, founded by solution architect Pranav Gore.",
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
  updated: "2026-10-21",
};

// Organization node for JSON-LD, shared by every page's @graph.
export function org(origin) {
  return {
    "@type": "ProfessionalService",
    "@id": origin + "/#org",
    name: SITE.brand,
    url: origin + "/",
    logo: origin + "/logo.png",
    image: origin + "/og.png",
    description: SITE.brandDescription,
    email: "mailto:" + SITE.email,
    founder: { "@id": origin + "/#person" },
    address: { "@type": "PostalAddress", addressLocality: SITE.city, addressRegion: SITE.region, addressCountry: SITE.country },
    areaServed: "AU",
    sameAs: [SITE.linkedin],
  };
}
