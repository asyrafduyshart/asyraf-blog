import { Chip, Separator } from "@heroui/react";
import type { Metadata } from "next";
import Image from "next/image";
import NextLink from "next/link";
import { notFound } from "next/navigation";

import { HtmlLang } from "@/components/html-lang";
import { PostBody } from "@/components/post-body";
import { siteConfig } from "@/lib/site";
import { formatDate, languageLabel, readingTimeLabel } from "@/lib/text";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import { POST_QUERY, POST_SLUGS_QUERY } from "@/sanity/queries";
import type { Post, PostSlug } from "@/sanity/types";

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
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const language = post.language ?? "id";
  const date = formatDate(post.publishedAt ?? undefined, language);
  const headline = post.heroHeadline ?? post.title;
  const subheadline = post.heroSubheadline ?? post.excerpt;
  const mainImage = post.mainImage?.asset ? post.mainImage : null;
  const imageDimensions = mainImage?.asset?.metadata?.dimensions;

  return (
    <article lang={language}>
      <HtmlLang lang={language} />

      {/* Magazine-style hero */}
      <header className="hero-surface border-b border-separator">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-6 pt-20 pb-16 text-center sm:pt-28 sm:pb-24">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-muted">
            {date && post.publishedAt ? (
              <time dateTime={post.publishedAt}>{date}</time>
            ) : null}
            <span aria-hidden className="text-separator-tertiary">
              •
            </span>
            <span>{readingTimeLabel(post.estimatedReadingTime, language)}</span>
            <Chip color="accent" size="sm" variant="soft">
              <Chip.Label>{languageLabel(language)}</Chip.Label>
            </Chip>
          </div>

          <h1 className="mt-8 font-serif text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-6xl">
            {headline}
          </h1>

          {subheadline ? (
            <p className="mt-7 max-w-2xl font-serif text-xl leading-8 text-muted text-pretty sm:text-2xl sm:leading-9">
              {subheadline}
            </p>
          ) : null}
        </div>
      </header>

      {mainImage ? (
        <figure className="mx-auto -mt-10 max-w-4xl px-6 sm:-mt-14">
          <Image
            priority
            alt={mainImage.alt ?? headline}
            blurDataURL={mainImage.asset?.metadata?.lqip ?? undefined}
            className="w-full rounded-2xl border border-separator bg-surface shadow-xl"
            height={
              imageDimensions?.aspectRatio
                ? Math.round(1600 / imageDimensions.aspectRatio)
                : 900
            }
            placeholder={mainImage.asset?.metadata?.lqip ? "blur" : "empty"}
            sizes="(max-width: 896px) 100vw, 896px"
            src={urlFor(mainImage).width(1600).fit("max").url()}
            width={1600}
          />
          {mainImage.alt ? (
            <figcaption className="mt-3 text-center text-sm text-muted">
              {mainImage.alt}
            </figcaption>
          ) : null}
        </figure>
      ) : null}

      {/* Long-form body */}
      <div className="mx-auto max-w-2xl px-6 pt-14 pb-10 sm:pt-16">
        {post.body && post.body.length > 0 ? (
          <PostBody value={post.body} />
        ) : null}
      </div>

      <footer className="mx-auto max-w-2xl px-6 pb-24">
        <Separator className="mb-8" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <NextLink
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-accent"
            href="/"
          >
            <span aria-hidden>←</span>
            {language === "en" ? "All posts" : "Semua tulisan"}
          </NextLink>
          {date ? (
            <p className="text-sm text-muted">
              {language === "en" ? "Published" : "Diterbitkan"} {date}
            </p>
          ) : null}
        </div>
      </footer>
    </article>
  );
}
