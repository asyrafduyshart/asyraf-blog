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
      const publishedAt = post.publishedAt
        ? new Date(post.publishedAt)
        : null;
      const pubDate =
        publishedAt && !Number.isNaN(publishedAt.getTime())
          ? publishedAt.toUTCString()
          : null;
      return `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${escapeXml(url)}</link>
  <guid isPermaLink="true">${escapeXml(url)}</guid>
  ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ""}
  ${post.excerpt ? `<description>${escapeXml(post.excerpt)}</description>` : ""}
</item>`;
    })
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(siteConfig.title)}</title>
  <link>${escapeXml(siteConfig.url)}</link>
  <description>${escapeXml(siteConfig.description)}</description>
  <language>id</language>
  ${items}
</channel>
</rss>`,
    { headers: { "content-type": "application/rss+xml; charset=utf-8" } },
  );
}
