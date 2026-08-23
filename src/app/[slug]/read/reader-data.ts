import type { Metadata } from "next";

import { splitReaderSections, type ReaderSection } from "@/lib/reader-sections";
import { siteConfig } from "@/lib/site";
import { client } from "@/sanity/client";
import { POST_QUERY } from "@/sanity/queries";
import type { Post, PostLanguage } from "@/sanity/types";

export interface ReaderData {
  post: Post;
  language: PostLanguage;
  sections: ReaderSection[];
}

/** Loads a post and splits it into reader sections; null when unreadable. */
export async function getReaderData(slug: string): Promise<ReaderData | null> {
  const post = await client.fetch<Post | null>(
    POST_QUERY,
    { slug },
    { next: { revalidate: 60 } },
  );

  if (!post) return null;

  const sections = splitReaderSections(post.body);
  if (sections.length === 0) return null;

  return { post, language: post.language ?? "id", sections };
}

/**
 * Reader pages canonicalize to the post and stay out of the index —
 * they are an alternate presentation of the same content.
 */
export function readerMetadata(data: ReaderData): Metadata {
  const { post, language } = data;
  const modeLabel = language === "en" ? "Reading mode" : "Mode baca";

  return {
    title: { absolute: `${post.title} — ${modeLabel} · ${siteConfig.name}` },
    robots: { index: false, follow: true },
    alternates: { canonical: `/${post.slug}` },
  };
}
