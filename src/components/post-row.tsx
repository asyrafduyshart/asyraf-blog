import Image from "next/image";
import NextLink from "next/link";

import { CategoryChips } from "@/components/category-chips";
import { formatDate, readingTimeLabel } from "@/lib/text";
import { urlFor } from "@/sanity/image";
import type { PostListItem } from "@/sanity/types";

export function PostRow({
  post,
  headingLevel = 3,
}: {
  post: PostListItem;
  headingLevel?: 2 | 3 | 4;
}) {
  const language = post.language ?? "id";
  const date = formatDate(post.publishedAt ?? undefined, language);
  const cover = post.mainImage?.asset ? post.mainImage : null;

  return (
    <article className="group relative grid gap-5 border-t border-border py-7 sm:grid-cols-[160px_1fr]">
      {cover ? (
        <div className="relative aspect-[3/2] overflow-hidden border border-border bg-surface sm:aspect-[4/3]">
          <Image
            alt={cover.alt ?? post.title}
            blurDataURL={cover.asset?.metadata?.lqip ?? undefined}
            className="object-cover object-top"
            fill
            placeholder={cover.asset?.metadata?.lqip ? "blur" : "empty"}
            sizes="(max-width: 640px) 100vw, 160px"
            src={urlFor(cover).width(480).height(360).fit("crop").url()}
          />
        </div>
      ) : (
        <div
          aria-hidden
          className="aspect-[3/2] border border-border bg-[var(--paper-soft)] sm:aspect-[4/3]"
        />
      )}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-[length:var(--step--1)] text-muted">
          <CategoryChips categories={post.categories?.slice(0, 1)} />
          {date && post.publishedAt ? (
            <time dateTime={post.publishedAt}>{date}</time>
          ) : null}
          <span aria-hidden>·</span>
          <span>{readingTimeLabel(post.estimatedReadingTime, language)}</span>
        </div>
        {headingLevel === 2 ? (
          <h2 className="mt-3 font-heading text-[length:var(--step-2)] leading-tight font-semibold tracking-[-0.02em]">
            <NextLink
              className="decoration-[var(--rule-strong)] underline-offset-4 after:absolute after:inset-0 hover:underline hover:decoration-2 hover:decoration-[var(--ochre-deep)]"
              href={`/${post.slug}`}
            >
              {post.title}
            </NextLink>
          </h2>
        ) : headingLevel === 4 ? (
          <h4 className="mt-3 font-heading text-[length:var(--step-2)] leading-tight font-semibold tracking-[-0.02em]">
            <NextLink
              className="decoration-[var(--rule-strong)] underline-offset-4 after:absolute after:inset-0 hover:underline hover:decoration-2 hover:decoration-[var(--ochre-deep)]"
              href={`/${post.slug}`}
            >
              {post.title}
            </NextLink>
          </h4>
        ) : (
          <h3 className="mt-3 font-heading text-[length:var(--step-2)] leading-tight font-semibold tracking-[-0.02em]">
          <NextLink
            className="decoration-[var(--rule-strong)] underline-offset-4 after:absolute after:inset-0 hover:underline hover:decoration-2 hover:decoration-[var(--ochre-deep)]"
            href={`/${post.slug}`}
          >
            {post.title}
          </NextLink>
          </h3>
        )}
        {post.excerpt ? (
          <p className="mt-2 line-clamp-1 text-base leading-relaxed text-muted">
            {post.excerpt}
          </p>
        ) : null}
      </div>
    </article>
  );
}
