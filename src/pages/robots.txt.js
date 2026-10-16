export function GET({ site }) {
  const origin = site.href.replace(/\/$/, "");
  return new Response(`User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: ${origin}/sitemap-index.xml
`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
