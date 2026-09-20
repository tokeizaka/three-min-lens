import Parser from "rss-parser";

export type NewsCandidate = {
  title: string;
  url: string;
  summary: string;
  source: string;
  publishedAt: string | null;
};

const parser = new Parser();

function stripHtml(input = "") {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 700);
}

export async function collectNewsCandidates(): Promise<NewsCandidate[]> {
  const feeds = (process.env.NEWS_FEEDS ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  if (feeds.length === 0) {
    throw new Error("NEWS_FEEDS is empty. Add trusted RSS feed URLs.");
  }

  const all: NewsCandidate[] = [];
  for (const feedUrl of feeds) {
    try {
      const feed = await parser.parseURL(feedUrl);
      for (const item of feed.items.slice(0, 20)) {
        if (!item.title || !item.link) continue;
        all.push({
          title: item.title.trim(),
          url: item.link,
          summary: stripHtml(item.contentSnippet || item.content || item.summary || ""),
          source: feed.title || new URL(feedUrl).hostname,
          publishedAt: item.isoDate || item.pubDate || null,
        });
      }
    } catch (error) {
      console.error("RSS fetch failed", feedUrl, error);
    }
  }

  const deduped = new Map<string, NewsCandidate>();
  for (const item of all) {
    const key = item.url.split("?")[0];
    if (!deduped.has(key)) deduped.set(key, item);
  }

  const maxAgeHours = Number(process.env.MAX_NEWS_AGE_HOURS || "48");
  const cutoff = Date.now() - maxAgeHours * 60 * 60 * 1000;

  return [...deduped.values()]
    .filter((item) => !item.publishedAt || Date.parse(item.publishedAt) >= cutoff)
    .sort((a, b) => {
      const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      return tb - ta;
    })
    .slice(0, 60);
}
