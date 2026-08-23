import type { PortableTextBlock } from "@portabletext/types";

export type PostLanguage = "id" | "en";

export interface SanityImageAsset {
  _id: string;
  url: string;
  metadata?: {
    dimensions?: { width: number; height: number; aspectRatio: number };
    lqip?: string;
  } | null;
}

export interface SanityImage {
  _type: "image";
  asset?: SanityImageAsset | null;
  alt?: string | null;
  caption?: string | null;
  hotspot?: { x: number; y: number } | null;
  crop?: { top: number; bottom: number; left: number; right: number } | null;
}

export interface PostCategory {
  title: string;
  slug: string;
}

export interface PostListItem {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  publishedAt?: string | null;
  language?: PostLanguage | null;
  mainImage?: SanityImage | null;
  categories?: PostCategory[] | null;
  estimatedReadingTime: number;
}

export interface Post extends PostListItem {
  heroHeadline?: string | null;
  heroSubheadline?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  body?: PortableTextBlock[] | null;
}

export interface PostSlug {
  slug: string;
  publishedAt?: string | null;
}

export interface CategorySlug {
  slug: string;
}

export interface CategoryPage {
  _id: string;
  title: string;
  slug: string;
  description?: string | null;
  posts: PostListItem[];
}
