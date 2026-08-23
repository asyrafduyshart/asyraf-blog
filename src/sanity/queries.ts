import { defineQuery } from "next-sanity";

/**
 * Shared projection notes:
 * - `estimatedReadingTime` approximates words as characters / 5 and assumes
 *   ~180 words per minute for long-form reading.
 * - Only published posts with a slug are listed.
 */

export const POSTS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)]
    | order(coalesce(publishedAt, _createdAt) desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    language,
    mainImage { ..., asset->{ _id, url, metadata { dimensions, lqip } } },
    "estimatedReadingTime": math::max([1, round(length(pt::text(body)) / 5 / 180)])
  }
`);

export const POST_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    heroHeadline,
    heroSubheadline,
    publishedAt,
    language,
    seoTitle,
    seoDescription,
    mainImage { ..., asset->{ _id, url, metadata { dimensions, lqip } } },
    body[] {
      ...,
      _type == "image" => { ..., asset->{ _id, url, metadata { dimensions, lqip } } }
    },
    "estimatedReadingTime": math::max([1, round(length(pt::text(body)) / 5 / 180)])
  }
`);

export const POST_SLUGS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)] {
    "slug": slug.current,
    publishedAt
  }
`);
