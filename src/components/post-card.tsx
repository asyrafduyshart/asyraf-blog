import { Card, Chip } from "@heroui/react";
import Image from "next/image";
import NextLink from "next/link";

import { formatDate, languageLabel, readingTimeLabel } from "@/lib/text";
import { urlFor } from "@/sanity/image";
import type { PostListItem } from "@/sanity/types";

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      height="14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="14"
    >
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

export function PostCard({ post }: { post: PostListItem }) {
  const language = post.language ?? "id";
  const date = formatDate(post.publishedAt ?? undefined, language);
  const cover = post.mainImage?.asset ? post.mainImage : null;

  return (
    <Card className="group relative overflow-hidden rounded-lg border border-border bg-surface p-0 shadow-none transition-all duration-200 ease-out hover:border-border-secondary [@media(hover:hover)]:hover:-translate-y-1">
      {cover ? (
        <div className="relative aspect-[16/9] overflow-hidden border-b border-border">
          <Image
            alt={cover.alt ?? post.title}
            blurDataURL={cover.asset?.metadata?.lqip ?? undefined}
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            fill
            placeholder={cover.asset?.metadata?.lqip ? "blur" : "empty"}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 560px"
            src={urlFor(cover).width(1120).height(630).fit("crop").url()}
          />
        </div>
      ) : null}

      <Card.Content className="flex flex-1 flex-col gap-3 p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-muted">
          {date && post.publishedAt ? (
            <>
              <time dateTime={post.publishedAt}>{date}</time>
              <span aria-hidden className="opacity-50">
                ·
              </span>
            </>
          ) : null}
          <span>{readingTimeLabel(post.estimatedReadingTime, language)}</span>
          <Chip className="ms-auto" color="accent" size="sm" variant="soft">
            <Chip.Label>{languageLabel(language)}</Chip.Label>
          </Chip>
        </div>

        <h3 className="font-heading text-xl leading-snug font-medium tracking-tight text-balance sm:text-[1.35rem]">
          <NextLink
            className="after:absolute after:inset-0 focus-visible:outline-none"
            href={`/${post.slug}`}
          >
            {post.title}
          </NextLink>
        </h3>

        {post.excerpt ? (
          <p className="line-clamp-2 text-[0.9375rem] leading-relaxed text-muted">
            {post.excerpt}
          </p>
        ) : null}

        <span className="mt-auto inline-flex items-center gap-2 pt-1 text-sm font-medium text-accent">
          {language === "en" ? "Read post" : "Baca tulisan"}
          <ArrowIcon className="transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </Card.Content>
    </Card>
  );
}
