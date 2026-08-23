import { Card } from "@heroui/react";
import Image from "next/image";
import NextLink from "next/link";

import { PostCard } from "@/components/post-card";
import { formatDate, readingTimeLabel } from "@/lib/text";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import { POSTS_QUERY } from "@/sanity/queries";
import type { PostListItem } from "@/sanity/types";

export const revalidate = 60;

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      height="15"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="15"
    >
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

/* Woodcut portrait beside the hero — B&W engraving, square to balance the grid. */
function HeroPortrait() {
  return (
    <div className="relative hidden aspect-square overflow-hidden rounded-2xl border border-border lg:block">
      <Image
        alt="Potret woodcut hitam-putih"
        className="object-cover"
        fill
        priority
        sizes="(min-width: 75rem) 28rem, 42vw"
        src="/images/hero-portrait.png"
      />
    </div>
  );
}

function FeaturedPost({ post }: { post: PostListItem }) {
  const language = post.language ?? "id";
  const date = formatDate(post.publishedAt ?? undefined, language);
  const cover = post.mainImage?.asset ? post.mainImage : null;

  return (
    <section
      aria-labelledby="featured-heading"
      className="rounded-2xl border border-border bg-surface px-6 py-8 sm:px-10 sm:py-10"
    >
      <div className="flex flex-col items-center gap-8 sm:flex-row sm:gap-10">
        {cover ? (
          <div className="relative w-40 shrink-0 sm:w-48">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-border">
              <Image
                alt={cover.alt ?? post.title}
                blurDataURL={cover.asset?.metadata?.lqip ?? undefined}
                className="object-cover"
                fill
                placeholder={cover.asset?.metadata?.lqip ? "blur" : "empty"}
                sizes="192px"
                src={urlFor(cover).width(576).height(768).fit("crop").url()}
              />
            </div>
          </div>
        ) : null}

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-xs font-semibold tracking-wider text-muted uppercase">
            Tulisan terbaru
          </p>
          <h2
            className="mt-2 font-heading text-2xl leading-tight font-medium tracking-tight text-balance sm:text-3xl"
            id="featured-heading"
          >
            {post.title}
          </h2>
          <p className="mt-1 text-sm text-muted sm:text-base">
            {date && post.publishedAt ? (
              <>
                <time dateTime={post.publishedAt}>{date}</time>
                <span aria-hidden className="mx-2 opacity-50">
                  ·
                </span>
              </>
            ) : null}
            {readingTimeLabel(post.estimatedReadingTime, language)}
          </p>
          {post.excerpt ? (
            <p className="mt-4 line-clamp-3 text-sm text-muted sm:text-base">
              {post.excerpt}
            </p>
          ) : null}
          <NextLink
            className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            href={`/${post.slug}`}
          >
            Baca sekarang
          </NextLink>
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const posts = await client.fetch<PostListItem[]>(
    POSTS_QUERY,
    {},
    { next: { revalidate: 60 } },
  );

  const latest = posts[0];

  const readingTimes = posts.map((post) => post.estimatedReadingTime);
  const minRead = Math.min(...readingTimes);
  const maxRead = Math.max(...readingTimes);
  const readingRange =
    posts.length > 0
      ? minRead === maxRead
        ? `${maxRead} menit baca`
        : `${minRead}–${maxRead} menit baca`
      : null;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-14 px-6 pt-8 pb-24 sm:pt-12">
      <section
        aria-labelledby="hero-heading"
        className="grid items-center gap-10 lg:grid-cols-[7fr_5fr] lg:gap-6"
      >
        <div className="lg:pr-6">
          <h1
            className="font-heading text-[clamp(2.5rem,6vw+0.5rem,4.25rem)] leading-[0.98] font-medium tracking-[-0.025em] text-balance text-foreground"
            id="hero-heading"
          >
            Di antara semua yang bisa dipilih, kenapa masih di sini?
          </h1>
          <p className="mt-5 max-w-[46ch] text-base text-pretty text-muted sm:text-lg">
            Catatan tentang AI, alat berpikir, dan pertanyaan yang tidak mau
            selesai — ditulis pelan-pelan, supaya tidak lari dari keraguan.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-2 gap-y-3">
            {latest ? (
              <NextLink
                className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                href={`/${latest.slug}`}
              >
                Baca tulisan terbaru
                <ArrowRightIcon />
              </NextLink>
            ) : null}
            <a
              className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-foreground transition-colors hover:bg-default-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              href="#tulisan"
            >
              Semua tulisan
            </a>
          </div>

          {readingRange ? (
            <p className="mt-5 text-sm text-muted">
              {posts.length} tulisan
              <span aria-hidden className="mx-2 opacity-50">
                ·
              </span>
              {readingRange}
            </p>
          ) : null}
        </div>

        <HeroPortrait />
      </section>

      {latest ? <FeaturedPost post={latest} /> : null}

      {posts.length > 0 ? (
        <section
          aria-label="Daftar tulisan"
          className="scroll-mt-24 space-y-4"
          id="tulisan"
        >
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
              Semua tulisan
            </h2>
            <span className="text-sm text-muted">{posts.length} tulisan</span>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        </section>
      ) : (
        <Card className="rounded-lg border border-dashed border-border bg-transparent p-10 text-center shadow-none">
          <p className="text-lg font-medium">Belum ada tulisan.</p>
          <p className="mt-2 text-muted">Tulisan baru akan muncul di sini.</p>
        </Card>
      )}
    </div>
  );
}
