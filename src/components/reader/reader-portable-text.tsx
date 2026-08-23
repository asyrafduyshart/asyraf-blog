"use client";

import {
  PortableText,
  type PortableTextComponents,
  type PortableTextMarkComponentProps,
} from "@portabletext/react";
import type { PortableTextBlock, TypedObject } from "@portabletext/types";
import Image from "next/image";
import NextLink from "next/link";

import { urlFor } from "@/sanity/image";
import type { SanityImage } from "@/sanity/types";

interface LinkMark extends TypedObject {
  _type: "link";
  href?: string;
}

function ReaderLink({
  value,
  children,
}: PortableTextMarkComponentProps<LinkMark>) {
  const href = value?.href ?? "#";
  const isInternal = href.startsWith("/") || href.startsWith("#");

  if (isInternal) {
    return <NextLink href={href}>{children}</NextLink>;
  }

  return (
    <a href={href} rel="noopener noreferrer" target="_blank">
      {children}
    </a>
  );
}

function ReaderImage({ value }: { value: SanityImage }) {
  if (!value?.asset) return null;

  const dimensions = value.asset.metadata?.dimensions;
  const width = Math.min(dimensions?.width ?? 1440, 1440);
  const height = dimensions?.aspectRatio
    ? Math.round(width / dimensions.aspectRatio)
    : Math.round((width * 9) / 16);

  return (
    <figure>
      <Image
        alt={value.alt ?? ""}
        blurDataURL={value.asset.metadata?.lqip ?? undefined}
        height={height}
        placeholder={value.asset.metadata?.lqip ? "blur" : "empty"}
        sizes="(max-width: 768px) 100vw, 672px"
        src={urlFor(value).width(1440).fit("max").url()}
        width={width}
      />
      {value.caption ? <figcaption>{value.caption}</figcaption> : null}
    </figure>
  );
}

/*
 * Semantic tags only — all reader typography lives in the `.reader-content`
 * styles so it scales with the font-size pref and follows the reader theme.
 * h2s never appear here (they become section boundaries); any stray ones
 * are rendered as h3 to keep one title per section.
 */
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h2: ({ children }) => <h3>{children}</h3>,
    h3: ({ children }) => <h3>{children}</h3>,
    h4: ({ children }) => <h4>{children}</h4>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => <code>{children}</code>,
    link: ReaderLink,
  },
  types: {
    image: ReaderImage,
  },
};

export function ReaderPortableText({ value }: { value: PortableTextBlock[] }) {
  return <PortableText components={components} value={value} />;
}
