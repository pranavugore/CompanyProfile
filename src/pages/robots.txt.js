// Search engines and AI crawlers are all welcome. Named agents are listed so the
// intent is explicit, even where "User-agent: *" already covers them.
const AGENTS = [
  // Search engines
  "Googlebot", "Bingbot", "DuckDuckBot", "Applebot",
  // OpenAI: search index, user-initiated fetches, training
  "OAI-SearchBot", "ChatGPT-User", "GPTBot",
  // Anthropic: search index, user-initiated fetches, training
  "Claude-SearchBot", "Claude-User", "ClaudeBot",
  // Perplexity: index and user-initiated fetches
  "PerplexityBot", "Perplexity-User",
  // Google Gemini / Apple Intelligence / Meta AI controls
  "Google-Extended", "Applebot-Extended", "Meta-ExternalAgent", "Meta-ExternalFetcher",
  // Others
  "MistralAI-User", "DuckAssistBot", "CCBot",
];

export function GET({ site }) {
  const origin = site.href.replace(/\/$/, "");
  const named = AGENTS.map((a) => `User-agent: ${a}\nAllow: /\n`).join("\n");
  return new Response(`User-agent: *
Allow: /

${named}
Sitemap: ${origin}/sitemap-index.xml
`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
