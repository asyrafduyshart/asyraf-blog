import Image from "next/image";
import NextLink from "next/link";

import { Tape } from "../../components/shared/Tape";
import { PostRow } from "@/components/post-row";
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

function HeroPortrait() {
  return (
    <div className="paper-print relative mx-auto aspect-square w-full max-w-md -rotate-[1.5deg] p-3 lg:block">
      <Tape />
      <Image
        alt="Potret woodcut Asyraf Duyshart"
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
      className="grid items-center gap-10 border-y border-border py-12 md:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]"
    >
      <figure>
        <div className="paper-print relative aspect-[3/2]">
          <Tape />
          {cover ? (
            <Image
              alt={cover.alt ?? post.title}
              blurDataURL={cover.asset?.metadata?.lqip ?? undefined}
              className="object-cover"
              fill
              placeholder={cover.asset?.metadata?.lqip ? "blur" : "empty"}
              sizes="(max-width: 768px) 100vw, 52vw"
              src={urlFor(cover).width(1200).height(800).fit("crop").url()}
            />
          ) : null}
        </div>
        <figcaption className="mt-3 text-[length:var(--step--1)] text-muted">
          Gbr. 01 — Tulisan terbaru dari meja kerja.
        </figcaption>
      </figure>
      <div>
        <p className="text-[length:var(--step--1)] text-muted">
          {post.categories?.[0]?.title ?? "Catatan"} ·{" "}
          {date && post.publishedAt ? (
            <time dateTime={post.publishedAt}>{date}</time>
          ) : null}{" "}
          · {readingTimeLabel(post.estimatedReadingTime, language)}
        </p>
        <h2
          className="mt-4 max-w-[18ch] font-heading text-[length:var(--step-4)] leading-[1.02] font-semibold tracking-[-0.03em] text-balance"
          id="featured-heading"
        >
          {post.title}
        </h2>
        {post.excerpt ? (
          <p className="mt-5 max-w-[55ch] text-[length:var(--step-1)] leading-relaxed text-muted">
            {post.excerpt}
          </p>
        ) : null}
        <NextLink className="text-link-arrow mt-7 inline-flex" href={`/${post.slug}`}>
          Baca tulisan <span aria-hidden>→</span>
        </NextLink>
      </div>
    </section>
  );
}

function SeriesShelf({ posts }: { posts: PostListItem[] }) {
  const imagePosts = posts.filter((post) =>
    post.categories?.some((category) => category.slug === "ai-image"),
  );
  const covers = imagePosts.filter((post) => post.mainImage?.asset).slice(0, 3);

  return (
    <section aria-labelledby="series-heading">
      <h2 className="font-heading text-[length:var(--step-3)] font-semibold" id="series-heading">
        Seri di rak
      </h2>
      <div className="mt-7 grid gap-5 md:grid-cols-2">
        <NextLink
          className="group grid min-h-80 overflow-hidden bg-[var(--ink)] p-7 text-[var(--paper-card)] no-underline sm:p-9"
          href="/kategori/ai-image"
        >
          <div className="flex h-28 items-start">
            {covers.map((post, index) => (
              <div
                className="relative -mr-8 aspect-[3/4] h-28 border border-[var(--paper-card)] bg-[var(--paper-soft)]"
                key={post._id}
                style={{ transform: `rotate(${(index - 1) * 5}deg)` }}
              >
                <Image
                  alt={post.mainImage?.alt ?? post.title}
                  className="object-cover"
                  fill
                  sizes="84px"
                  src={urlFor(post.mainImage!).width(252).height(336).fit("crop").url()}
                />
              </div>
            ))}
          </div>
          <div className="self-end">
            <p className="font-note text-[var(--ochre-soft)]">Travel sketchbook</p>
            <h3 className="mt-2 font-heading text-[length:var(--step-3)] leading-tight">
              Kota, poster, dan cara mesin membayangkannya.
            </h3>
            <span className="mt-5 inline-block font-semibold underline underline-offset-4">
              Lihat seri →
            </span>
          </div>
        </NextLink>
        <NextLink
          className="group grid min-h-80 bg-[var(--terracotta-deep)] p-7 text-[var(--paper-card)] no-underline sm:p-9"
          href="/kategori/ai-image"
        >
          <p className="font-note text-[var(--paper-card)]">Prompt guides / AI Image</p>
          <div className="self-end">
            <h3 className="font-heading text-[length:var(--step-3)] leading-tight">
              Template yang bisa dibongkar, bukan mantra.
            </h3>
            <p className="mt-4 max-w-[44ch] leading-relaxed">
              Komposisi, kota, dan catatan produksi untuk membuat gambar yang
              punya arah.
            </p>
            <span className="mt-5 inline-block font-semibold underline underline-offset-4">
              Lihat seri →
            </span>
          </div>
        </NextLink>
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

  const postsByMonth = posts.reduce<Record<string, PostListItem[]>>(
    (groups, post) => {
      const date = post.publishedAt ? new Date(post.publishedAt) : new Date(0);
      const key = new Intl.DateTimeFormat("id-ID", {
        month: "long",
        year: "numeric",
      }).format(date);
      (groups[key] ??= []).push(post);
      return groups;
    },
    {},
  );

  return (
    <div className="page-shell space-y-[var(--section)] pt-12 pb-[var(--section)] sm:pt-20">
      <section
        aria-labelledby="hero-heading"
        className="grid items-center gap-12 lg:grid-cols-[7fr_5fr] lg:gap-16"
      >
        <div>
          <h1
            className="max-w-[18ch] font-heading text-[length:var(--step-5)] leading-[.98] font-semibold tracking-[-.03em] text-balance"
            id="hero-heading"
          >
            <span>Di antara semua yang bisa dipilih,</span>{" "}
            <span className="text-[var(--ink-mute)]">kenapa masih di sini?</span>
          </h1>
          <p className="mt-6 max-w-[46ch] text-[length:var(--step-1)] leading-relaxed text-pretty text-muted">
            Bukan self-help. Lebih ke self-roast yang dibungkus seperti essay.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {latest ? (
              <NextLink
                className="button-solid"
                href={`/${latest.slug}`}
              >
                Baca tulisan terbaru
                <ArrowRightIcon />
              </NextLink>
            ) : null}
            <a
              className="text-link-arrow inline-flex min-h-11 items-center"
              href="#tulisan"
            >
              Semua tulisan
            </a>
          </div>
          {readingRange ? (
            <p className="font-note mt-6 text-base text-[var(--ink-soft)]">
              {posts.length} tulisan
              <span aria-hidden> · </span>{readingRange}
            </p>
          ) : null}
        </div>

        <HeroPortrait />
      </section>

      {latest ? <FeaturedPost post={latest} /> : null}
      <SeriesShelf posts={posts} />

      {posts.length > 0 ? (
        <section
          aria-label="Daftar tulisan"
          className="scroll-mt-24"
          id="tulisan"
        >
          <h2 className="font-heading text-[length:var(--step-4)] font-semibold tracking-[-.02em]">
            Semua tulisan
          </h2>
          <div className="mt-10">
            {Object.entries(postsByMonth).map(([month, monthPosts]) => (
              <section className="grid gap-6 md:grid-cols-[160px_1fr]" key={month}>
                <h3 className="font-note pt-7 text-lg text-[var(--ochre-ink)]">
                  {month}
                </h3>
                <div>
                  {monthPosts.map((post) => (
                    <PostRow key={post._id} post={post} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      ) : (
        <div className="border border-dashed border-border p-10 text-center">
          <p className="text-lg font-medium">Belum ada tulisan.</p>
          <p className="mt-2 text-muted">Tulisan baru akan muncul di sini.</p>
        </div>
      )}
    </div>
  );
}
