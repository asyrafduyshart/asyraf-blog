import type {
  PortableTextComponents,
  PortableTextMarkComponentProps,
  PortableTextTypeComponentProps,
} from "@portabletext/react";
import type { PortableTextBlock, TypedObject } from "@portabletext/types";
import Image from "next/image";
import NextLink from "next/link";
import { PortableText, toPlainText } from "next-sanity";

import { PromptSnippetCard } from "@/components/prompt-snippet-card";
import { urlFor } from "@/sanity/image";
import type {
  PostLanguage,
  PromptSnippetBlock,
  SanityImage,
} from "@/sanity/types";

interface LinkMark extends TypedObject {
  _type: "link";
  href?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .slice(0, 80);
}

function headingId(value: PortableTextBlock): string | undefined {
  const id = slugify(toPlainText(value));
  return id.length > 0 ? id : undefined;
}

function BodyLink({
  value,
  children,
}: PortableTextMarkComponentProps<LinkMark>) {
  const href = value?.href ?? "#";
  const isInternal = href.startsWith("/") || href.startsWith("#");
  const className =
    "font-medium text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent";

  if (isInternal) {
    return (
      <NextLink className={className} href={href}>
        {children}
      </NextLink>
    );
  }

  return (
    <a className={className} href={href} rel="noopener noreferrer" target="_blank">
      {children}
    </a>
  );
}

function BodyImage({ value }: { value: SanityImage }) {
  if (!value?.asset) return null;

  const dimensions = value.asset.metadata?.dimensions;
  const width = Math.min(dimensions?.width ?? 1440, 1440);
  const height = dimensions?.aspectRatio
    ? Math.round(width / dimensions.aspectRatio)
    : Math.round((width * 9) / 16);

  return (
    <figure className="my-10 sm:my-12">
      <Image
        alt={value.alt ?? ""}
        blurDataURL={value.asset.metadata?.lqip ?? undefined}
        className="w-full rounded-lg border border-border bg-surface"
        height={height}
        placeholder={value.asset.metadata?.lqip ? "blur" : "empty"}
        sizes="(max-width: 768px) 100vw, 672px"
        src={urlFor(value).width(1440).fit("max").url()}
        width={width}
      />
      {value.caption ? (
        <figcaption className="mt-3 text-center text-sm text-muted">
          {value.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

const baseComponents: Omit<PortableTextComponents, "types"> = {
  block: {
    normal: ({ children }) => <p className="mb-6 text-pretty">{children}</p>,
    h2: ({ children, value }) => (
      <h2
        className="mt-12 mb-3 scroll-mt-24 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        id={headingId(value)}
      >
        {children}
      </h2>
    ),
    h3: ({ children, value }) => (
      <h3
        className="mt-10 mb-3 scroll-mt-24 font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
        id={headingId(value)}
      >
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-8 mb-2 font-heading text-lg font-semibold tracking-tight text-foreground">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-8 border-s-2 border-accent/40 ps-4 text-muted italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="my-6 list-disc space-y-2 ps-6 marker:text-muted">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="my-6 list-decimal space-y-2 ps-6 marker:text-muted">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="rounded-md bg-default px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
        {children}
      </code>
    ),
    link: BodyLink,
  },
};

export function PostBody({
  value,
  language = "id",
}: {
  value: PortableTextBlock[];
  language?: PostLanguage;
}) {
  // The prompt-snippet copy button is labeled in the post's language.
  const components: PortableTextComponents = {
    ...baseComponents,
    types: {
      image: BodyImage,
      promptSnippet: ({
        value: snippet,
      }: PortableTextTypeComponentProps<PromptSnippetBlock>) => (
        <PromptSnippetCard language={language} snippet={snippet} />
      ),
    },
  };

  // Reading rhythm borrowed from F15's reader: ~18px body,
  // 1.75 line height, prose-width measure.
  return (
    <div className="mx-auto max-w-prose text-lg leading-[1.75] text-foreground/90">
      <PortableText components={components} value={value} />
    </div>
  );
}
