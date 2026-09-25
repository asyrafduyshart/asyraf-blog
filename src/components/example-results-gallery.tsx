"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { slugifyHeading } from "@/lib/text";
import { urlFor } from "@/sanity/image";
import type {
  ExampleResultsBlock,
  PostLanguage,
  SanityImage,
} from "@/sanity/types";

type GalleryImage = SanityImage & {
  asset: NonNullable<SanityImage["asset"]>;
};

function galleryLabels(language: PostLanguage) {
  const isEnglish = language === "en";
  return {
    region: isEnglish ? "Example results" : "Contoh hasil",
    expand: isEnglish ? "Expand image" : "Perbesar gambar",
    close: isEnglish ? "Close" : "Tutup",
    previous: isEnglish ? "Previous image" : "Gambar sebelumnya",
    next: isEnglish ? "Next image" : "Gambar berikutnya",
  };
}

const LIGHTBOX_BUTTON_CLASS =
  "inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

/**
 * Responsive grid for `exampleResults` body blocks (title + intro +
 * poster images), with a dependency-free lightbox on a native modal
 * `<dialog>`: click / Enter to expand, Esc or backdrop click to close,
 * arrow keys to move between images.
 *
 * `variant="post"` uses the site design tokens; `variant="reader"` leans
 * on the `--reader-*` variables plus the `.reader-content` typography
 * (see the `[data-example-gallery]` overrides in globals.css).
 */
export function ExampleResultsGallery({
  value,
  language = "id",
  variant = "post",
}: {
  value: ExampleResultsBlock;
  language?: PostLanguage;
  variant?: "post" | "reader";
}) {
  const images = (value.images ?? []).filter((image): image is GalleryImage =>
    Boolean(image?.asset),
  );

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // <dialog> is imperative — sync it with state after render.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (activeIndex !== null && !dialog.open) {
      dialog.showModal();
    } else if (activeIndex === null && dialog.open) {
      dialog.close();
    }
  }, [activeIndex]);

  const showRelative = useCallback(
    (step: number) => {
      setActiveIndex((current) => {
        if (current === null || images.length === 0) return current;
        return (current + step + images.length) % images.length;
      });
    },
    [images.length],
  );

  if (images.length === 0) return null;

  const labels = galleryLabels(language);
  const isReader = variant === "reader";
  const isSingle = images.length === 1;
  // 3-up rows on larger screens, except a 2×2 square for exactly 4 images.
  const threeUp = images.length >= 3 && images.length !== 4;

  const title = value.title?.trim() ? value.title.trim() : null;
  const intro = value.intro?.trim() ? value.intro.trim() : null;
  const titleId = title ? slugifyHeading(title) || undefined : undefined;

  const active = activeIndex !== null ? images[activeIndex] : null;
  const activeDimensions = active?.asset.metadata?.dimensions;
  const activeWidth = Math.min(activeDimensions?.width ?? 1200, 1600);
  const activeHeight = activeDimensions?.aspectRatio
    ? Math.round(activeWidth / activeDimensions.aspectRatio)
    : Math.round((activeWidth * 4) / 3);
  const activeCaption = active ? (active.caption ?? active.alt) : null;

  return (
    <section
      aria-label={title ?? labels.region}
      className={isReader ? "my-[1.8em]" : "my-10 sm:my-12"}
      data-example-gallery
    >
      {title ? (
        isReader ? (
          <h3 id={titleId}>{title}</h3>
        ) : (
          <h2
            className="mb-3 scroll-mt-24 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            id={titleId}
          >
            {title}
          </h2>
        )
      ) : null}

      {intro ? (
        <p
          className={
            isReader ? "text-(--reader-muted)" : "mb-6 text-muted text-pretty"
          }
        >
          {intro}
        </p>
      ) : null}

      <div
        className={clsx(
          "grid gap-3 sm:gap-4",
          isSingle ? "mx-auto max-w-sm grid-cols-1" : "grid-cols-2",
          threeUp && "sm:grid-cols-3",
          // Editorial breakout: the grid stretches past the prose column on
          // large screens while title/intro keep the text measure.
          !isReader && !isSingle && "lg:-mx-20",
        )}
      >
        {images.map((image, index) => {
          const caption = image.caption?.trim() ? image.caption.trim() : null;
          const tileLabel = caption ?? image.alt ?? null;

          return (
            <figure key={image._key ?? image.asset._id}>
              <button
                aria-label={
                  tileLabel ? `${labels.expand} — ${tileLabel}` : labels.expand
                }
                className={clsx(
                  "group block w-full cursor-zoom-in overflow-hidden border transition-colors",
                  isReader
                    ? "border-(--reader-border)"
                    : "border-border bg-surface hover:border-accent/50",
                )}
                type="button"
                onClick={() => setActiveIndex(index)}
              >
                <Image
                  alt={image.alt ?? caption ?? ""}
                  blurDataURL={image.asset.metadata?.lqip ?? undefined}
                  className={clsx(
                    "w-full object-cover",
                    // Uniform 3:4 poster tiles; a lone image keeps its ratio.
                    !isSingle && "aspect-3/4",
                  )}
                  height={960}
                  placeholder={image.asset.metadata?.lqip ? "blur" : "empty"}
                  sizes={
                    isSingle
                      ? "(max-width: 640px) 92vw, 384px"
                      : threeUp
                        ? "(max-width: 640px) 46vw, (max-width: 1024px) 31vw, 270px"
                        : "(max-width: 640px) 46vw, 330px"
                  }
                  src={
                    isSingle
                      ? urlFor(image).width(960).fit("max").url()
                      : urlFor(image).width(720).height(960).fit("crop").url()
                  }
                  width={720}
                />
              </button>
              {caption ? (
                <figcaption
                  className={
                    isReader
                      ? undefined
                      : "mt-2 px-1 text-center text-[0.8125rem] leading-snug text-muted"
                  }
                >
                  Gbr. {index + 1} — {caption}
                </figcaption>
              ) : null}
            </figure>
          );
        })}
      </div>

      <dialog
        ref={dialogRef}
        aria-label={title ?? labels.region}
        className="m-0 h-dvh max-h-none w-dvw max-w-none bg-transparent p-0 backdrop:bg-[rgb(42_36_32_/_92%)]"
        onClose={() => setActiveIndex(null)}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") showRelative(1);
          else if (event.key === "ArrowLeft") showRelative(-1);
        }}
      >
        {active ? (
          <div
            className="relative flex h-full w-full flex-col items-center justify-center gap-4 p-4 pt-14 sm:p-8"
            onClick={(event) => {
              if (event.target === event.currentTarget) setActiveIndex(null);
            }}
          >
            <button
              aria-label={labels.close}
              className={clsx(LIGHTBOX_BUTTON_CLASS, "absolute top-4 right-4")}
              type="button"
              onClick={() => setActiveIndex(null)}
            >
              <X aria-hidden size={18} strokeWidth={2} />
            </button>

            <figure className="flex min-h-0 flex-col items-center gap-3">
              <Image
                key={active.asset._id}
                alt={active.alt ?? active.caption ?? ""}
                blurDataURL={active.asset.metadata?.lqip ?? undefined}
                className="max-h-[78dvh] w-auto max-w-full object-contain"
                height={activeHeight}
                placeholder={active.asset.metadata?.lqip ? "blur" : "empty"}
                sizes="(max-width: 768px) 92vw, 700px"
                src={urlFor(active).width(1600).fit("max").url()}
                width={activeWidth}
              />
              {activeCaption ? (
                <figcaption className="max-w-prose text-center text-sm text-white/85">
                  {activeCaption}
                </figcaption>
              ) : null}
            </figure>

            {images.length > 1 ? (
              <div className="flex items-center gap-2">
                <button
                  aria-label={labels.previous}
                  className={LIGHTBOX_BUTTON_CLASS}
                  type="button"
                  onClick={() => showRelative(-1)}
                >
                  <ChevronLeft aria-hidden size={18} strokeWidth={2} />
                </button>
                <span
                  aria-live="polite"
                  className="min-w-14 text-center text-sm text-white/80 tabular-nums"
                >
                  {(activeIndex ?? 0) + 1} / {images.length}
                </span>
                <button
                  aria-label={labels.next}
                  className={LIGHTBOX_BUTTON_CLASS}
                  type="button"
                  onClick={() => showRelative(1)}
                >
                  <ChevronRight aria-hidden size={18} strokeWidth={2} />
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </dialog>
    </section>
  );
}
