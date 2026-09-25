import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import NextLink from "next/link";
import { notFound } from "next/navigation";

import { CategoryChips } from "@/components/category-chips";
import { HtmlLang } from "@/components/html-lang";
import { PostBody } from "@/components/post-body";
import Tape from "@/components/shared/Tape";
import { splitReaderSections } from "@/lib/reader-sections";
import { siteConfig } from "@/lib/site";
import { formatDate, languageLabel, readingTimeLabel } from "@/lib/text";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import { POSTS_QUERY, POST_QUERY, POST_SLUGS_QUERY } from "@/sanity/queries";
import type { Post, PostListItem, PostSlug } from "@/sanity/types";

export const revalidate = 60;

async function getPost(slug: string): Promise<Post | null> {
  return client.fetch<Post | null>(
    POST_QUERY,
    { slug },
    { next: { revalidate: 60 } },
  );
}

export async function generateStaticParams() {
  const slugs = await client.fetch<PostSlug[]>(POST_SLUGS_QUERY);

  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: "Tulisan tidak ditemukan" };
  }

  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt ?? undefined;
  const language = post.language ?? "id";
  const ogImage = post.mainImage?.asset
    ? urlFor(post.mainImage).width(1200).height(630).fit("crop").url()
    : undefined;

  return {
    // seoTitle is an explicit override — use it verbatim instead of the
    // layout's `%s — Asyraf` template (it usually carries its own branding).
    title: post.seoTitle ? { absolute: post.seoTitle } : post.title,
    description,
    alternates: { canonical: `/${post.slug}` },
    openGraph: {
      type: "article",
      url: `/${post.slug}`,
      title,
      description,
      siteName: siteConfig.domain,
      locale: language === "en" ? "en_US" : "id_ID",
      publishedTime: post.publishedAt ?? undefined,
      ...(ogImage
        ? { images: [{ url: ogImage, width: 1200, height: 630 }] }
        : {}),
    },
  };
}

export default async function PostPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([
    getPost(slug),
    client.fetch<PostListItem[]>(
      POSTS_QUERY,
      {},
      { next: { revalidate: 60 } },
    ),
  ]);

  if (!post) {
    notFound();
  }

  const language = post.language ?? "id";
  const date = formatDate(post.publishedAt ?? undefined, language);
  const headline = post.heroHeadline ?? post.title;
  const subheadline = post.heroSubheadline ?? post.excerpt;
  const mainImage = post.mainImage?.asset ? post.mainImage : null;
  const imageDimensions = mainImage?.asset?.metadata?.dimensions;
  // Reading mode is only offered when the body yields at least one section.
  const hasReaderSections = splitReaderSections(post.body).length > 0;
  const postIndex = allPosts.findIndex((item) => item.slug === post.slug);
  const newerPost = postIndex > 0 ? allPosts[postIndex - 1] : null;
  const olderPost =
    postIndex >= 0 && postIndex < allPosts.length - 1
      ? allPosts[postIndex + 1]
      : null;
  const footerLabels =
    language === "en"
      ? {
          newer: "Newer",
          older: "Older",
          reply: "Something stuck? Reply on",
        }
      : {
          newer: "Lebih baru",
          older: "Lebih lama",
          reply: "Ada yang nyangkut? Balas di",
        };

  return (
    <article
      data-article-category-href={
        post.categories?.[0]
          ? `/kategori/${post.categories[0].slug}`
          : undefined
      }
      data-article-category-label={post.categories?.[0]?.title ?? undefined}
      lang={language}
    >
      <HtmlLang lang={language} />

      <header className="page-shell pt-16 pb-12 sm:pt-24 sm:pb-16">
        <div className="max-w-[var(--text)]">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-[length:var(--step--1)] text-muted">
            <CategoryChips categories={post.categories?.slice(0, 1)} />
            {date && post.publishedAt ? (
              <>
                <time dateTime={post.publishedAt}>{date}</time>
                <span aria-hidden className="opacity-50">
                  ·
                </span>
              </>
            ) : null}
            <span>{readingTimeLabel(post.estimatedReadingTime, language)}</span>
            {language === "en" ? <span className="chip">{languageLabel(language)}</span> : null}
          </div>
          <h1 className="mt-7 max-w-[20ch] font-heading text-[length:var(--step-5)] leading-[1.02] font-semibold tracking-[-.03em] text-balance">
            {headline}
          </h1>

          {subheadline ? (
            <p className="mt-6 max-w-[60ch] text-[length:var(--step-1)] leading-relaxed text-muted text-pretty">
              {subheadline}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Image
              alt="Potret Asyraf Duyshart"
              className="size-9 rounded-full border border-border object-cover"
              height={36}
              src="/images/hero-portrait.png"
              width={36}
            />
            <p className="text-sm text-[var(--ink-soft)]">Asyraf Duyshart · BSD</p>
            {hasReaderSections ? (
              <NextLink className="button-paper" href={`/${post.slug}/read`}>
                <BookOpen aria-hidden size={16} strokeWidth={1.75} />
                {language === "en" ? "Reading mode" : "Mode baca"}
              </NextLink>
            ) : null}
          </div>
        </div>
      </header>

      {mainImage ? (
        <figure className="paper-print relative mx-auto max-w-[var(--wide)] p-3">
          <Tape className="blog-tape-top" />
          <Image
              priority
              alt={mainImage.alt ?? headline}
              blurDataURL={mainImage.asset?.metadata?.lqip ?? undefined}
              className="h-auto w-full"
              height={
                imageDimensions?.aspectRatio
                  ? Math.round(1600 / imageDimensions.aspectRatio)
                  : 900
              }
              placeholder={mainImage.asset?.metadata?.lqip ? "blur" : "empty"}
              sizes="(max-width: 1024px) 100vw, 1024px"
              src={urlFor(mainImage).width(1600).fit("max").url()}
              width={1600}
            />
          <figcaption className="mt-3 text-[length:var(--step--1)] text-muted">
            Gbr. sampul — {mainImage.caption ?? mainImage.alt ?? headline}
          </figcaption>
        </figure>
      ) : null}

      <div className="mx-auto max-w-[var(--measure)] px-[var(--gutter)] pt-16 pb-12 sm:pt-24">
        {post.body && post.body.length > 0 ? (
          <PostBody language={language} value={post.body} />
        ) : null}
      </div>

      <footer className="mx-auto max-w-[var(--measure)] px-[var(--gutter)] pb-[var(--section)]">
        <div className="border-t border-border pt-8">
          {date ? (
            <p className="text-[length:var(--step--1)] text-muted">
              {language === "en" ? "Published" : "Diterbitkan"} {date} · BSD
            </p>
          ) : null}
          <nav className="mt-10 grid gap-4 sm:grid-cols-2" aria-label="Tulisan lain">
            {newerPost ? (
              <NextLink className="border-t border-border py-5" href={`/${newerPost.slug}`}>
                <span className="font-note text-[var(--ochre-ink)]">
                  {footerLabels.newer}
                </span>
                <strong className="mt-2 block font-heading text-xl">{newerPost.title}</strong>
              </NextLink>
            ) : <span />}
            {olderPost ? (
              <NextLink className="border-t border-border py-5 sm:text-right" href={`/${olderPost.slug}`}>
                <span className="font-note text-[var(--ochre-ink)]">
                  {footerLabels.older}
                </span>
                <strong className="mt-2 block font-heading text-xl">{olderPost.title}</strong>
              </NextLink>
            ) : null}
          </nav>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-5">
            <NextLink className="text-link-arrow inline-flex min-h-11 items-center" href="/">
              ← {language === "en" ? "All posts" : "Semua tulisan"}
            </NextLink>
            <p className="font-note text-[var(--ink-soft)]">
              {footerLabels.reply}{" "}
              <a className="underline" href="https://x.com/AsyrafDuyshart">
                X @asyrafduyshart
              </a>
            </p>
          </div>
        </div>
      </footer>
    </article>
  );
}
