import type { PortableTextBlock } from "@portabletext/types";
import { toPlainText } from "next-sanity";

export interface ReaderSection {
  key: string;
  /** `null` for the intro/only section — callers fall back to the post title. */
  title: string | null;
  blocks: PortableTextBlock[];
}

function isH2Block(block: PortableTextBlock): boolean {
  return block._type === "block" && block.style === "h2";
}

function isEmptyTextBlock(block: PortableTextBlock): boolean {
  if (block._type !== "block") return false;
  return toPlainText(block).trim().length === 0;
}

/**
 * Splits a Portable Text body into reader sections on h2 blocks, mirroring
 * the F15 reader's chapter pagination.
 *
 * - Each h2 starts a new section titled with the h2 text; the h2 block
 *   itself is dropped (the reader renders the title as its own heading).
 * - Blocks before the first h2 become an untitled intro section.
 * - A body without h2s yields a single untitled section.
 * - Images and other custom blocks stay inside whichever section they
 *   fall in, so sections keep their visuals.
 */
export function splitReaderSections(
  body: PortableTextBlock[] | null | undefined,
): ReaderSection[] {
  if (!body || body.length === 0) return [];

  const sections: ReaderSection[] = [];
  let currentTitle: string | null = null;
  let currentBlocks: PortableTextBlock[] = [];
  let started = false;

  const pushCurrent = () => {
    const hasContent =
      currentTitle !== null ||
      currentBlocks.some((block) => !isEmptyTextBlock(block));
    if (!hasContent) return;

    sections.push({
      key: `section-${sections.length + 1}`,
      title: currentTitle,
      blocks: currentBlocks,
    });
  };

  for (const block of body) {
    if (isH2Block(block)) {
      if (started) pushCurrent();
      started = true;
      const title = toPlainText(block).trim();
      currentTitle = title.length > 0 ? title : null;
      currentBlocks = [];
      continue;
    }

    started = true;
    currentBlocks.push(block);
  }

  if (started) pushCurrent();

  return sections;
}

export function clampSectionIndex(value: number, total: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(Math.max(Math.trunc(value), 1), Math.max(total, 1));
}
