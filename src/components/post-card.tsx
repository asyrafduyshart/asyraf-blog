import { Card, Chip } from "@heroui/react";
import NextLink from "next/link";

import { formatDate, languageLabel, readingTimeLabel } from "@/lib/text";
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

  return (
    <Card className="group relative overflow-hidden border border-separator p-0 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg">
      <Card.Content className="flex flex-col gap-4 p-7 sm:p-9">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
          {date && post.publishedAt ? (
            <time dateTime={post.publishedAt}>{date}</time>
          ) : null}
          <span aria-hidden className="text-separator-tertiary">
            •
          </span>
          <span>{readingTimeLabel(post.estimatedReadingTime, language)}</span>
          <Chip className="ms-auto" color="accent" size="sm" variant="soft">
            <Chip.Label>{languageLabel(language)}</Chip.Label>
          </Chip>
        </div>

        <h2 className="font-serif text-2xl font-semibold tracking-tight text-balance transition-colors group-hover:text-accent sm:text-[1.75rem] sm:leading-snug">
          <NextLink className="after:absolute after:inset-0" href={`/${post.slug}`}>
            {post.title}
          </NextLink>
        </h2>

        {post.excerpt ? (
          <p className="line-clamp-3 leading-7 text-muted">{post.excerpt}</p>
        ) : null}

        <span className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-accent">
          {language === "en" ? "Read post" : "Baca tulisan"}
          <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </Card.Content>
    </Card>
  );
}
