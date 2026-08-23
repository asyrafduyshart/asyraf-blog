import type { PortableTextBlock } from "@portabletext/types";
import { toPlainText } from "next-sanity";

import type { ExampleResultsBlock, SanityImage } from "@/sanity/types";

function isEmptyTextBlock(block: PortableTextBlock): boolean {
  if (block._type !== "block") return false;
  return toPlainText(block).trim().length === 0;
}

/**
 * Groups runs of two or more consecutive `image` blocks into a synthetic
 * `exampleResults` block, so galleries authored as stacked images (e.g. the
 * posters under an h2 like "Contoh hasil" / "Example results") get the same
 * grid treatment as the dedicated block — without touching the content.
 *
 * - Single images keep their full-width figure rendering.
 * - Empty paragraphs *between* images (a common authoring artifact) don't
 *   break a run and are dropped with it; trailing ones are preserved.
 * - Synthetic galleries carry no `title`/`intro` — the preceding heading,
 *   if any, stays a regular body block.
 */
export function groupConsecutiveImages(
  blocks: PortableTextBlock[],
): PortableTextBlock[] {
  const grouped: PortableTextBlock[] = [];
  let run: SanityImage[] = [];
  let held: PortableTextBlock[] = [];

  const flush = () => {
    if (run.length >= 2) {
      const gallery: ExampleResultsBlock = {
        _type: "exampleResults",
        _key: `image-run-${run[0]._key ?? grouped.length}`,
        images: run,
      };
      grouped.push(gallery as unknown as PortableTextBlock);
    } else if (run.length === 1) {
      grouped.push(run[0] as unknown as PortableTextBlock);
    }
    grouped.push(...held);
    run = [];
    held = [];
  };

  for (const block of blocks) {
    if (block._type === "image") {
      held = [];
      run.push(block as unknown as SanityImage);
      continue;
    }

    if (run.length > 0 && isEmptyTextBlock(block)) {
      held.push(block);
      continue;
    }

    flush();
    grouped.push(block);
  }

  flush();

  return grouped;
}
