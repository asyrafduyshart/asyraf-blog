import clsx from "clsx";
import NextLink from "next/link";

import type { PostCategory } from "@/sanity/types";

/**
 * Category pills styled like F15 collection badges: rounded-full,
 * primary/10 background, primary text. Renders nothing without categories.
 */
export function CategoryChips({
  categories,
  className,
}: {
  categories?: PostCategory[] | null;
  className?: string;
}) {
  if (!categories || categories.length === 0) return null;

  return (
    <ul className={clsx("flex flex-wrap items-center gap-1.5", className)}>
      {categories.map((category) => (
        <li key={category.slug}>
          {/* z-10 keeps chips clickable above card-wide overlay links. */}
          <NextLink
            className="relative z-10 inline-flex items-center rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            href={`/kategori/${category.slug}`}
          >
            {category.title}
          </NextLink>
        </li>
      ))}
    </ul>
  );
}
