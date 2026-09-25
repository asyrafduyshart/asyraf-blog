"use client";

import { ChevronLeft, ChevronRight, Settings2, X } from "lucide-react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
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

function parseSectionFromPath(pathname: string): number | null {
  const match = pathname.match(/\/read\/(\d+)\/?$/);
  if (!match) return null;
  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) ? value : null;
}

/**
 * Full-screen reading mode, ported from the F15 Library reader.
 *
 * Section navigation is client-side (directional slide + fade); the URL is
 * kept in sync via the History API so every section stays deep-linkable at
 * `/[slug]/read/[section]`. The URL is the source of truth: browser
 * back/forward between sections is handled by a `popstate` listener
 * (Next.js restores native-pushState entries without re-rendering), and
 * on mount the current pathname wins over the server-provided section.
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
  const router = useRouter();
  const { prefs, updatePrefs } = useReaderPrefs();

  const [view, setView] = useState<ReaderView>(() => ({
    index: clampSectionIndex(initialSection, total),
    direction: 0,
  }));
  const [settingsOpen, setSettingsOpen] = useState(false);

  const viewRef = useRef(view);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLAnchorElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
    window.requestAnimationFrame(() => settingsButtonRef.current?.focus());
  }, []);

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

  // Mount sync: adopt the section encoded in the current URL (it can
  // differ from `initialSection` when a history entry is restored), fall
  // back to the stored position on the base `/read` route, and normalize
  // the URL to the canonical `/read/{n}` form.
  useEffect(() => {
    const urlSection = parseSectionFromPath(window.location.pathname);
    let target: number;

    if (urlSection !== null) {
      target = clampSectionIndex(urlSection, total);
    } else if (resume) {
      const stored = readStoredReaderPosition(post.slug);
      target =
        stored && stored >= 1 && stored <= total
          ? stored
          : clampSectionIndex(initialSection, total);
    } else {
      target = clampSectionIndex(initialSection, total);
    }

    if (target !== viewRef.current.index) {
      setView({ index: target, direction: 0 });
    }
    if (urlSection !== target) {
      window.history.replaceState(null, "", readerUrl(post.slug, target));
    }
    // Mount-only: initial props are stable for the lifetime of the reader.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Browser back/forward between section entries: Next.js restores the
  // URL without re-rendering, so follow it here. URLs outside the reader
  // (e.g. back to the post) are ignored — the router unmounts us instead.
  useEffect(() => {
    const onPopState = () => {
      const urlSection = parseSectionFromPath(window.location.pathname);
      if (urlSection === null) return;
      goTo(clampSectionIndex(urlSection, total), { push: false });
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [goTo, total]);

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
    const background = Array.from(
      document.querySelectorAll<HTMLElement>(".ay-masthead, .ay-footer"),
    );
    root.style.overflow = "hidden";
    background.forEach((element) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });
    closeRef.current?.focus();
    return () => {
      root.style.overflow = previousOverflow;
      background.forEach((element) => {
        element.inert = false;
        element.removeAttribute("aria-hidden");
      });
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
        // First Escape closes the settings panel, the next one the reader.
        if (settingsOpen) {
          closeSettings();
        } else {
          router.push(`/${post.slug}`);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeSettings, goTo, post.slug, router, settingsOpen]);

  const section = sections[view.index - 1];
  if (!section) return null;

  const sectionTitle = section.title ?? post.title;

  return (
    <div
      aria-label={post.title}
      aria-modal="true"
      className="reader-root fixed inset-0 z-50 flex flex-col"
      role="dialog"
    >
      {/* Header: close · post + section title · settings */}
      <header className="relative border-b border-(--reader-border)">
        <div className="mx-auto grid h-14 w-full max-w-5xl grid-cols-[3rem_minmax(0,1fr)_3rem] items-center px-2 sm:px-4">
          <NextLink
            ref={closeRef}
            aria-label={labels.close}
            className="reader-icon-btn justify-self-start"
            href={`/${post.slug}`}
          >
            <X aria-hidden size={20} strokeWidth={1.75} />
          </NextLink>

          <div className="min-w-0 text-center">
            {/* The intro section falls back to the post title — avoid
                printing the same line twice in the header. */}
            {sectionTitle !== post.title ? (
              <p className="truncate text-xs text-(--reader-muted)">
                {post.title}
              </p>
            ) : null}
            <p className="truncate text-sm font-medium">{sectionTitle}</p>
          </div>

          <button
            ref={settingsButtonRef}
            aria-controls="reader-settings"
            aria-expanded={settingsOpen}
            aria-label={labels.settings}
            className="reader-icon-btn justify-self-end"
            type="button"
            onClick={() =>
              settingsOpen ? closeSettings() : setSettingsOpen(true)
            }
          >
            <Settings2 aria-hidden size={20} strokeWidth={1.75} />
          </button>
        </div>

        {settingsOpen ? (
          <ReaderSettings
            labels={labels}
            prefs={prefs}
            onChange={updatePrefs}
            onClose={closeSettings}
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
            <ReaderPortableText language={post.language} value={section.blocks} />
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

          <p
            aria-live="polite"
            className="text-xs text-(--reader-muted) tabular-nums sm:text-sm"
          >
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
