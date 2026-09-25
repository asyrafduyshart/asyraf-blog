import clsx from "clsx";
import NextLink from "next/link";

import type { PostCategory } from "@/sanity/types";

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
            className="chip relative z-10"
            href={`/kategori/${category.slug}`}
          >
            {category.title}
          </NextLink>
        </li>
      ))}
    </ul>
  );
}
