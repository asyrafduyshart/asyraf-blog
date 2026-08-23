import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HtmlLang } from "@/components/html-lang";
import { Reader } from "@/components/reader/reader";
import { clampSectionIndex } from "@/lib/reader-sections";

import { getReaderData, readerMetadata } from "../reader-data";

export const revalidate = 60;

function parseSectionParam(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const parsed = Number.parseInt(raw, 10);
  return parsed >= 1 ? parsed : null;
}

export async function generateMetadata({
  params,
}: PageProps<"/[slug]/read/[section]">): Promise<Metadata> {
  const { slug } = await params;
  const data = await getReaderData(slug);

  if (!data) {
    return { title: "Tulisan tidak ditemukan" };
  }

  return readerMetadata(data);
}

export default async function ReadSectionPage({
  params,
}: PageProps<"/[slug]/read/[section]">) {
  const { slug, section } = await params;
  const requested = parseSectionParam(section);
  const data = requested === null ? null : await getReaderData(slug);

  if (!data) {
    notFound();
  }

  const { post, language, sections } = data;

  return (
    <>
      <HtmlLang lang={language} />
      <Reader
        // Out-of-range deep links clamp to the nearest section; the reader
        // normalizes the URL after mount.
        initialSection={clampSectionIndex(requested ?? 1, sections.length)}
        post={{ title: post.title, slug: post.slug, language }}
        sections={sections}
      />
    </>
  );
}
