import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site";
import { client } from "@/sanity/client";
import { POST_SLUGS_QUERY } from "@/sanity/queries";
import type { PostSlug } from "@/sanity/types";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await client.fetch<PostSlug[]>(POST_SLUGS_QUERY);

  return [
    {
      url: siteConfig.url,
      changeFrequency: "daily",
      priority: 1,
    },
    ...slugs.map(({ slug, publishedAt }) => ({
      url: `${siteConfig.url}/${slug}`,
      lastModified: publishedAt ?? undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
