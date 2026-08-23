import { Card } from "@heroui/react";
import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";

import { PostCard } from "@/components/post-card";
import { client } from "@/sanity/client";
import { CATEGORY_PAGE_QUERY, CATEGORY_SLUGS_QUERY } from "@/sanity/queries";
import type { CategoryPage, CategorySlug } from "@/sanity/types";

export const revalidate = 60;

async function getCategory(slug: string): Promise<CategoryPage | null> {
  return client.fetch<CategoryPage | null>(
    CATEGORY_PAGE_QUERY,
    { slug },
    { next: { revalidate: 60 } },
  );
}

export async function generateStaticParams() {
  const slugs = await client.fetch<CategorySlug[]>(CATEGORY_SLUGS_QUERY);

  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/kategori/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return { title: "Kategori tidak ditemukan" };
  }

  return {
    title: `Kategori: ${category.title}`,
    description:
      category.description ??
      `Tulisan dalam kategori ${category.title} di blog Asyraf.`,
    alternates: { canonical: `/kategori/${category.slug}` },
  };
}

export default async function CategoryPageRoute({
  params,
}: PageProps<"/kategori/[slug]">) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const { posts } = category;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pt-8 pb-24 sm:pt-12">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase">
          Kategori
        </p>
        <h1 className="mt-3 font-heading text-4xl leading-[1.05] font-medium tracking-tight text-balance sm:text-5xl">
          {category.title}
        </h1>
        {category.description ? (
          <p className="mt-4 text-lg leading-8 text-pretty text-muted">
            {category.description}
          </p>
        ) : null}
        <p className="mt-4 text-sm text-muted">
          {posts.length} tulisan
        </p>
      </header>

      <section aria-label={`Tulisan dalam kategori ${category.title}`}>
        {posts.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <Card className="mt-10 rounded-lg border border-dashed border-border bg-transparent p-10 text-center shadow-none">
            <p className="text-lg font-medium">
              Belum ada tulisan dalam kategori ini.
            </p>
            <p className="mt-2 text-muted">
              Tulisan baru akan muncul di sini.
            </p>
          </Card>
        )}
      </section>

      <NextLink
        className="mt-12 inline-flex items-center gap-2 rounded-full text-sm font-medium text-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        href="/"
      >
        <span aria-hidden>←</span>
        Semua tulisan
      </NextLink>
    </div>
  );
}
