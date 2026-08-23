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
  /** Present when the image lives inside an array (body, galleries). */
  _key?: string;
  asset?: SanityImageAsset | null;
  alt?: string | null;
  caption?: string | null;
  hotspot?: { x: number; y: number } | null;
  crop?: { top: number; bottom: number; left: number; right: number } | null;
}

/**
 * Custom Portable Text block for copyable prompts:
 * `{ name: 'promptSnippet', type: 'object' }` with `title` + `code` fields.
 */
export interface PromptSnippetBlock {
  _type: "promptSnippet";
  _key?: string;
  title?: string | null;
  code?: string | null;
}

/**
 * Custom Portable Text block for example-result galleries:
 * `{ name: 'exampleResults', type: 'object' }` with `title` + `intro`
 * and an `images` array (image + alt/caption, hotspot enabled).
 *
 * Also produced synthetically by `groupConsecutiveImages` when a body
 * contains runs of plain consecutive images (legacy posts without the
 * dedicated block) — those carry no `title`/`intro`.
 */
export interface ExampleResultsBlock {
  _type: "exampleResults";
  _key?: string;
  title?: string | null;
  intro?: string | null;
  images?: SanityImage[] | null;
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
