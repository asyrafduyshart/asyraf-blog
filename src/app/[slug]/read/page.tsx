import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HtmlLang } from "@/components/html-lang";
import { Reader } from "@/components/reader/reader";
import { client } from "@/sanity/client";
import { POST_SLUGS_QUERY } from "@/sanity/queries";
import type { PostSlug } from "@/sanity/types";

import { getReaderData, readerMetadata } from "./reader-data";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await client.fetch<PostSlug[]>(POST_SLUGS_QUERY);

  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[slug]/read">): Promise<Metadata> {
  const { slug } = await params;
  const data = await getReaderData(slug);

  if (!data) {
    return { title: "Tulisan tidak ditemukan" };
  }

  return readerMetadata(data);
}

export default async function ReadPage({ params }: PageProps<"/[slug]/read">) {
  const { slug } = await params;
  const data = await getReaderData(slug);

  if (!data) {
    notFound();
  }

  const { post, language, sections } = data;

  return (
    <>
      <HtmlLang lang={language} />
      <Reader
        initialSection={1}
        post={{ title: post.title, slug: post.slug, language }}
        resume
        sections={sections}
      />
    </>
  );
}
