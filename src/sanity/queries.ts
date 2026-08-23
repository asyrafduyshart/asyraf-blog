import { defineQuery } from "next-sanity";

/**
 * Shared projection notes:
 * - `estimatedReadingTime` approximates words as characters / 5 and assumes
 *   ~180 words per minute for long-form reading.
 * - Only published posts with a slug are listed.
 * - `categories` dereferences to `{ title, slug }` and drops dangling or
 *   unpublished references so the UI can trust every entry.
 */

const POST_LIST_FIELDS = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  language,
  mainImage { ..., asset->{ _id, url, metadata { dimensions, lqip } } },
  "categories": (categories[]->{ title, "slug": slug.current })[defined(title) && defined(slug)],
  "estimatedReadingTime": math::max([1, round(length(pt::text(body)) / 5 / 180)])
`;

export const POSTS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)]
    | order(coalesce(publishedAt, _createdAt) desc) {
    ${POST_LIST_FIELDS}
  }
`);

export const POST_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug][0] {
    ${POST_LIST_FIELDS},
    heroHeadline,
    heroSubheadline,
    seoTitle,
    seoDescription,
    body[] {
      ...,
      _type == "image" => { ..., asset->{ _id, url, metadata { dimensions, lqip } } }
    }
  }
`);

export const POST_SLUGS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)] {
    "slug": slug.current,
    publishedAt
  }
`);

export const CATEGORY_SLUGS_QUERY = defineQuery(`
  *[_type == "category" && defined(slug.current)] {
    "slug": slug.current
  }
`);

/** A category plus every post that references it, newest first. */
export const CATEGORY_PAGE_QUERY = defineQuery(`
  *[_type == "category" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    "posts": *[
      _type == "post" &&
      defined(slug.current) &&
      ^._id in categories[]._ref
    ] | order(coalesce(publishedAt, _createdAt) desc) {
      ${POST_LIST_FIELDS}
    }
  }
`);
