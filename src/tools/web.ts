import type { WebSearchResult } from "../types.js";

function classifySource(url: string): WebSearchResult["sourceType"] {
  if (/docs\.|developer\.|github\.com|nodejs\.org|typescriptlang\.org/i.test(url)) {
    return "official";
  }

  if (/stackoverflow\.com|reddit\.com|dev\.to/i.test(url)) {
    return "community";
  }

  return "unknown";
}

export async function getSiteContents(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "coding-agent-plugin/0.1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`get_site_contents failed: ${response.status}`);
  }

  const html = await response.text();
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.slice(0, 50000);
}

export async function webSearch(query: string): Promise<WebSearchResult[]> {
  const endpoint = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const response = await fetch(endpoint, {
    headers: {
      "User-Agent": "coding-agent-plugin/0.1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`web_search failed: ${response.status}`);
  }

  const html = await response.text();
  const matches = [...html.matchAll(/<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g)].slice(0, 5);

  return matches.map((match) => {
    const url = match[1];
    const title = match[2].replace(/<[^>]+>/g, "").trim();
    return {
      title,
      url,
      snippet: "",
      sourceType: classifySource(url),
    };
  });
}
