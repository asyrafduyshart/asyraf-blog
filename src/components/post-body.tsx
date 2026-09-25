import type {
  PortableTextComponents,
  PortableTextMarkComponentProps,
  PortableTextTypeComponentProps,
} from "@portabletext/react";
import type { PortableTextBlock, TypedObject } from "@portabletext/types";
import Image from "next/image";
import NextLink from "next/link";
import { PortableText, toPlainText } from "next-sanity";

import { ExampleResultsGallery } from "@/components/example-results-gallery";
import { PromptSnippetCard } from "@/components/prompt-snippet-card";
import { groupConsecutiveImages } from "@/lib/example-results";
import { slugifyHeading } from "@/lib/text";
import { urlFor } from "@/sanity/image";
import type {
  ExampleResultsBlock,
  PostLanguage,
  PromptSnippetBlock,
  SanityImage,
} from "@/sanity/types";

interface LinkMark extends TypedObject {
  _type: "link";
  href?: string;
}

function headingId(value: PortableTextBlock): string | undefined {
  const id = slugifyHeading(toPlainText(value));
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
    <figure className="article-figure my-12">
      <Image
        alt={value.alt ?? ""}
        blurDataURL={value.asset.metadata?.lqip ?? undefined}
        className="w-full border border-border bg-surface"
        height={height}
        placeholder={value.asset.metadata?.lqip ? "blur" : "empty"}
        sizes="(max-width: 768px) 100vw, 672px"
        src={urlFor(value).width(1440).fit("max").url()}
        width={width}
      />
      {value.caption ? (
        <figcaption className="mt-3 text-left text-[length:var(--step--1)] text-muted">
          {value.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

const baseComponents: Omit<PortableTextComponents, "types"> = {
  block: {
    normal: ({ children }) => <p className="mb-[1em] text-pretty">{children}</p>,
    h2: ({ children, value }) => (
      <h2
        className="mt-[2.5em] mb-4 scroll-mt-24 font-heading text-[length:var(--step-3)] font-semibold tracking-[-.02em] text-foreground"
        id={headingId(value)}
      >
        {children}
      </h2>
    ),
    h3: ({ children, value }) => (
      <h3
        className="mt-[2em] mb-3 scroll-mt-24 font-heading text-[length:var(--step-2)] font-semibold tracking-[-.01em] text-foreground"
        id={headingId(value)}
      >
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-8 mb-2 font-heading text-[length:var(--step-2)] font-semibold text-foreground">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="article-quote my-10 font-heading text-[length:var(--step-2)] leading-relaxed text-foreground italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="my-6 list-disc space-y-2 ps-6 marker:text-[var(--ochre)]">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="my-6 list-decimal space-y-2 ps-6 marker:font-heading marker:text-[var(--ochre-ink)]">
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
      <code className="rounded-[2px] bg-default px-1.5 py-0.5 font-mono text-[0.9em] text-foreground">
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
  // The prompt-snippet copy button and gallery lightbox controls are
  // labeled in the post's language.
  const components: PortableTextComponents = {
    ...baseComponents,
    types: {
      image: BodyImage,
      promptSnippet: ({
        value: snippet,
      }: PortableTextTypeComponentProps<PromptSnippetBlock>) => (
        <PromptSnippetCard language={language} snippet={snippet} />
      ),
      exampleResults: ({
        value: gallery,
      }: PortableTextTypeComponentProps<ExampleResultsBlock>) => (
        <ExampleResultsGallery language={language} value={gallery} />
      ),
    },
  };

  // Reading rhythm borrowed from F15's reader: ~18px body,
  // 1.75 line height, prose-width measure. Runs of consecutive images are
  // regrouped into example-results galleries before rendering.
  return (
    <div className="article-prose mx-auto max-w-[var(--measure)] text-[length:var(--step-1)] leading-[1.7] text-foreground">
      <PortableText
        components={components}
        value={groupConsecutiveImages(value)}
      />
    </div>
  );
}
