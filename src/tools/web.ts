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

export async function fetchWebContent(url: string): Promise<{ url: string; title?: string; content: string }> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "coding-agent-plugin/0.1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`fetch_web_content failed: ${response.status}`);
  }

  const html = await response.text();
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    url,
    title: titleMatch?.[1],
    content: text.slice(0, 40000),
  };
}

export async function wikipediaSearch(query: string): Promise<{ title: string; snippet: string; url: string }[]> {
  const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=10&format=json`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "coding-agent-plugin/0.1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`wikipedia_search failed: ${response.status}`);
  }

  const data = await response.json();
  const titles: string[] = data[1] || [];
  const snippets: string[] = data[2] || [];
  const urls: string[] = data[3] || [];

  return titles.map((title, i) => ({
    title,
    snippet: snippets[i] || "",
    url: urls[i] || "",
  }));
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
