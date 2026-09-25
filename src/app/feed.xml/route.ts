import { siteConfig } from "@/lib/site";
import { client } from "@/sanity/client";
import { POSTS_QUERY } from "@/sanity/queries";
import type { PostListItem } from "@/sanity/types";

export const revalidate = 60;

function escapeXml(value: string): string {
  return value.replace(
    /[<>&'"]/g,
    (character) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[character] ?? character,
  );
}

export async function GET() {
  const posts = await client.fetch<PostListItem[]>(
    POSTS_QUERY,
    {},
    { next: { revalidate: 60 } },
  );
  const items = posts
    .map((post) => {
      const url = `${siteConfig.url}/${post.slug}`;
      return `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${url}</link>
  <guid isPermaLink="true">${url}</guid>
  ${post.publishedAt ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>` : ""}
  ${post.excerpt ? `<description>${escapeXml(post.excerpt)}</description>` : ""}
</item>`;
    })
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(siteConfig.title)}</title>
  <link>${siteConfig.url}</link>
  <description>${escapeXml(siteConfig.description)}</description>
  <language>id</language>
  ${items}
</channel>
</rss>`,
    { headers: { "content-type": "application/rss+xml; charset=utf-8" } },
  );
}
