"use client";

import "@fontsource-variable/gelasio";

import { ChevronLeft, ChevronRight, Settings2, X } from "lucide-react";
import NextLink from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  persistReaderPosition,
  readStoredReaderPosition,
} from "@/lib/reader-prefs";
import { clampSectionIndex, type ReaderSection } from "@/lib/reader-sections";
import type { PostLanguage } from "@/sanity/types";

import { getReaderLabels } from "./reader-labels";
import { ReaderPortableText } from "./reader-portable-text";
import { ReaderSettings } from "./reader-settings";
import { useReaderPrefs } from "./use-reader-prefs";

export interface ReaderPost {
  title: string;
  slug: string;
  language: PostLanguage;
}

interface ReaderView {
  index: number;
  /** 1 = forward, -1 = backward, 0 = no transition (initial render). */
  direction: 1 | -1 | 0;
}

const SWIPE_THRESHOLD_PX = 56;

function readerUrl(slug: string, section: number): string {
  return `/${slug}/read/${section}`;
}

/**
 * Full-screen reading mode, ported from the F15 Library reader.
 *
 * Section navigation is client-side (directional slide + fade); the URL is
 * kept in sync via the History API so every section stays deep-linkable at
 * `/[slug]/read/[section]`. Browser back/forward re-renders the route,
 * which flows back in through `initialSection`.
 */
export function Reader({
  post,
  sections,
  initialSection,
  resume = false,
}: {
  post: ReaderPost;
  sections: ReaderSection[];
  initialSection: number;
  /** When true (the base `/read` route), restore the last visited section. */
  resume?: boolean;
}) {
  const total = sections.length;
  const labels = getReaderLabels(post.language);
  const { prefs, updatePrefs } = useReaderPrefs();

  const [view, setView] = useState<ReaderView>(() => ({
    index: clampSectionIndex(initialSection, total),
    direction: 0,
  }));
  const [settingsOpen, setSettingsOpen] = useState(false);

  const viewRef = useRef(view);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  const goTo = useCallback(
    (target: number, options?: { push?: boolean }) => {
      const clamped = clampSectionIndex(target, total);
      const previous = viewRef.current.index;
      if (clamped === previous) return;

      setView({ index: clamped, direction: clamped > previous ? 1 : -1 });
      setSettingsOpen(false);

      if (options?.push !== false) {
        window.history.pushState(null, "", readerUrl(post.slug, clamped));
      }
    },
    [post.slug, total],
  );

  // Resume the last visited section (base `/read` route only) and
  // normalize the URL when the requested section had to be clamped.
  useEffect(() => {
    let target = clampSectionIndex(initialSection, total);

    if (resume) {
      const stored = readStoredReaderPosition(post.slug);
      if (stored && stored >= 1 && stored <= total) {
        target = stored;
      }
    }

    if (target !== viewRef.current.index) {
      setView({ index: target, direction: 0 });
    }
    if (target !== initialSection) {
      window.history.replaceState(null, "", readerUrl(post.slug, target));
    }
    // Mount-only: initial props are stable for the lifetime of the reader.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Browser back/forward (or any external navigation between sections)
  // re-renders the route with a new `initialSection`.
  const previousInitialRef = useRef(initialSection);
  useEffect(() => {
    if (previousInitialRef.current === initialSection) return;
    previousInitialRef.current = initialSection;
    goTo(initialSection, { push: false });
  }, [goTo, initialSection]);

  // Remember the reading position per post (drives the resume behavior).
  useEffect(() => {
    persistReaderPosition(post.slug, view.index);
  }, [post.slug, view.index]);

  // Each section starts at the top.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [view.index]);

  // Lock the page behind the full-screen reader.
  useEffect(() => {
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previousOverflow;
    };
  }, []);

  // Keyboard: ← / → move between sections, Escape closes the settings.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(viewRef.current.index - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(viewRef.current.index + 1);
      } else if (event.key === "Escape") {
        setSettingsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goTo]);

  const section = sections[view.index - 1];
  if (!section) return null;

  const sectionTitle = section.title ?? post.title;

  return (
    <div className="reader-root fixed inset-0 z-50 flex flex-col">
      {/* Header: close · post + section title · settings */}
      <header className="relative border-b border-(--reader-border)">
        <div className="mx-auto grid h-14 w-full max-w-5xl grid-cols-[3rem_minmax(0,1fr)_3rem] items-center px-2 sm:px-4">
          <NextLink
            aria-label={labels.close}
            className="reader-icon-btn justify-self-start"
            href={`/${post.slug}`}
          >
            <X aria-hidden size={20} strokeWidth={1.75} />
          </NextLink>

          <div className="min-w-0 text-center">
            <p className="truncate text-xs text-(--reader-muted)">
              {post.title}
            </p>
            <p className="truncate text-sm font-medium">{sectionTitle}</p>
          </div>

          <button
            aria-expanded={settingsOpen}
            aria-label={labels.settings}
            className="reader-icon-btn justify-self-end"
            type="button"
            onClick={() => setSettingsOpen((open) => !open)}
          >
            <Settings2 aria-hidden size={20} strokeWidth={1.75} />
          </button>
        </div>

        {settingsOpen ? (
          <ReaderSettings
            labels={labels}
            prefs={prefs}
            onChange={updatePrefs}
            onClose={() => setSettingsOpen(false)}
          />
        ) : null}
      </header>

      {/* Scrollable section content with directional slide + fade */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain"
        ref={scrollRef}
        onTouchEnd={(event) => {
          const start = touchStartRef.current;
          touchStartRef.current = null;
          if (!start) return;

          const touch = event.changedTouches[0];
          if (!touch) return;

          const deltaX = touch.clientX - start.x;
          const deltaY = touch.clientY - start.y;
          if (
            Math.abs(deltaX) < SWIPE_THRESHOLD_PX ||
            Math.abs(deltaX) < Math.abs(deltaY) * 1.5
          ) {
            return;
          }

          goTo(viewRef.current.index + (deltaX < 0 ? 1 : -1));
        }}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          if (!touch) return;
          touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        }}
      >
        <article
          className={
            view.direction === 1
              ? "reader-enter-next mx-auto w-full max-w-2xl px-6 pt-10 pb-24 sm:pt-14"
              : view.direction === -1
                ? "reader-enter-prev mx-auto w-full max-w-2xl px-6 pt-10 pb-24 sm:pt-14"
                : "mx-auto w-full max-w-2xl px-6 pt-10 pb-24 sm:pt-14"
          }
          key={view.index}
          lang={post.language}
        >
          <div className="reader-content">
            <h1 className="reader-section-title">{sectionTitle}</h1>
            <ReaderPortableText value={section.blocks} />
          </div>
        </article>
      </div>

      {/* Footer: prev · progress · next */}
      <footer className="relative border-t border-(--reader-border)">
        <div
          aria-hidden
          className="absolute inset-x-0 -top-px h-0.5 overflow-hidden"
        >
          <div
            className="h-full bg-accent transition-[width] duration-300 ease-out"
            style={{ width: `${(view.index / total) * 100}%` }}
          />
        </div>

        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-2 px-2 sm:px-4">
          <button
            className="reader-nav-btn"
            disabled={view.index <= 1}
            type="button"
            onClick={() => goTo(view.index - 1)}
          >
            <ChevronLeft aria-hidden size={16} />
            {labels.previous}
          </button>

          <p className="text-xs text-(--reader-muted) tabular-nums sm:text-sm">
            {labels.progress(view.index, total)}
          </p>

          <button
            className="reader-nav-btn"
            disabled={view.index >= total}
            type="button"
            onClick={() => goTo(view.index + 1)}
          >
            {labels.next}
            <ChevronRight aria-hidden size={16} />
          </button>
        </div>
      </footer>
    </div>
  );
}
