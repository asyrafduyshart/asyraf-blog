import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";

import { PostRow } from "@/components/post-row";
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
    <div className="page-shell pt-16 pb-[var(--section)] sm:pt-24">
      <header className="max-w-[var(--text)] border-b border-border pb-10">
        <p className="font-note text-base text-[var(--ochre-ink)]">Kategori</p>
        <h1 className="mt-3 font-heading text-[length:var(--step-5)] leading-[1.02] font-semibold tracking-[-.03em] text-balance">
          {category.title}
        </h1>
        {category.description ? (
          <p className="mt-5 text-[length:var(--step-1)] leading-relaxed text-pretty text-muted">
            {category.description}
          </p>
        ) : null}
        <p className="mt-5 text-[length:var(--step--1)] text-muted">{posts.length} tulisan</p>
      </header>

      <section aria-label={`Tulisan dalam kategori ${category.title}`}>
        {posts.length > 0 ? (
          <div className="mt-10 max-w-4xl">
            {posts.map((post) => (
              <PostRow headingLevel={2} key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className="mt-10 border border-dashed border-border p-10 text-center">
            <p className="text-lg font-medium">
              Belum ada tulisan dalam kategori ini.
            </p>
            <p className="mt-2 text-muted">
              Tulisan baru akan muncul di sini.
            </p>
          </div>
        )}
      </section>

      <NextLink
        className="text-link-arrow mt-12 inline-flex min-h-11 items-center gap-2"
        href="/"
      >
        <span aria-hidden>←</span>
        Semua tulisan
      </NextLink>
    </div>
  );
}
