/**
 * Reading-mode preferences, ported from the F15 Library reader.
 *
 * Prefs live in one localStorage entry and are applied to <html> as:
 * - `--reader-font-size` (inline CSS variable, 14–24px)
 * - `data-reader-font`   (sans | serif | mono)
 * - `data-reader-theme`  (light | sepia | dark — absent when the reader
 *                         inherits the site theme)
 *
 * Only `.reader-*` scoped styles consume these, so applying them globally
 * is harmless outside the reader and lets a pre-paint script avoid a flash
 * of the wrong theme/size when a reader page is loaded directly.
 */

export const READER_PREFS_STORAGE_KEY = "asyraf-blog:reader-prefs";

/** Last visited section per post slug, so `/[slug]/read` can resume. */
export const READER_POSITION_STORAGE_KEY = "asyraf-blog:reader-position";

export const READER_MIN_FONT_SIZE = 14;
export const READER_MAX_FONT_SIZE = 24;
export const READER_DEFAULT_FONT_SIZE = 18;

export const READER_FONTS = ["sans", "serif", "mono"] as const;
export type ReaderFont = (typeof READER_FONTS)[number];

export const READER_THEMES = ["light", "sepia", "dark"] as const;
export type ReaderTheme = (typeof READER_THEMES)[number];

export interface ReaderPrefs {
  fontSize: number;
  font: ReaderFont;
  /** `null` inherits the site theme (independent of site dark mode). */
  theme: ReaderTheme | null;
}

export const DEFAULT_READER_PREFS: ReaderPrefs = {
  fontSize: READER_DEFAULT_FONT_SIZE,
  font: "serif",
  theme: null,
};

export function clampReaderFontSize(value: number): number {
  if (!Number.isFinite(value)) return READER_DEFAULT_FONT_SIZE;
  return Math.min(
    READER_MAX_FONT_SIZE,
    Math.max(READER_MIN_FONT_SIZE, Math.round(value)),
  );
}

function isReaderFont(value: unknown): value is ReaderFont {
  return READER_FONTS.includes(value as ReaderFont);
}

function isReaderTheme(value: unknown): value is ReaderTheme {
  return READER_THEMES.includes(value as ReaderTheme);
}

/** Parses a raw localStorage value, falling back field-by-field. */
export function parseReaderPrefs(raw: string | null): ReaderPrefs {
  if (!raw) return { ...DEFAULT_READER_PREFS };

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return { ...DEFAULT_READER_PREFS };
    }

    const candidate = parsed as Record<string, unknown>;

    return {
      fontSize: clampReaderFontSize(Number(candidate.fontSize)),
      font: isReaderFont(candidate.font)
        ? candidate.font
        : DEFAULT_READER_PREFS.font,
      theme: isReaderTheme(candidate.theme) ? candidate.theme : null,
    };
  } catch {
    return { ...DEFAULT_READER_PREFS };
  }
}

export function readStoredReaderPrefs(): ReaderPrefs {
  if (typeof window === "undefined") return { ...DEFAULT_READER_PREFS };
  try {
    return parseReaderPrefs(
      window.localStorage.getItem(READER_PREFS_STORAGE_KEY),
    );
  } catch {
    return { ...DEFAULT_READER_PREFS };
  }
}

export function persistReaderPrefs(prefs: ReaderPrefs): void {
  try {
    window.localStorage.setItem(
      READER_PREFS_STORAGE_KEY,
      JSON.stringify(prefs),
    );
  } catch {
    // Storage may be unavailable (private mode, quota) — prefs stay in memory.
  }
}

/** Reflects prefs onto <html> so reader CSS picks them up. */
export function applyReaderPrefs(prefs: ReaderPrefs): void {
  const root = document.documentElement;

  root.style.setProperty("--reader-font-size", `${prefs.fontSize}px`);
  root.dataset.readerFont = prefs.font;

  if (prefs.theme) {
    root.dataset.readerTheme = prefs.theme;
  } else {
    delete root.dataset.readerTheme;
  }
}

export function readStoredReaderPosition(slug: string): number | null {
  try {
    const raw = window.localStorage.getItem(READER_POSITION_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const value = (parsed as Record<string, unknown>)[slug];
    return typeof value === "number" && Number.isInteger(value) && value >= 1
      ? value
      : null;
  } catch {
    return null;
  }
}

export function persistReaderPosition(slug: string, section: number): void {
  try {
    const raw = window.localStorage.getItem(READER_POSITION_STORAGE_KEY);
    let parsed: Record<string, unknown> = {};
    if (raw) {
      const candidate: unknown = JSON.parse(raw);
      if (candidate && typeof candidate === "object") {
        parsed = candidate as Record<string, unknown>;
      }
    }
    parsed[slug] = section;
    window.localStorage.setItem(
      READER_POSITION_STORAGE_KEY,
      JSON.stringify(parsed),
    );
  } catch {
    // Best effort only.
  }
}

/**
 * Inline pre-paint script (rendered in the root layout) that applies stored
 * prefs before first paint, so opening the reader with dark/sepia or a
 * custom size never flashes the defaults. Must stay dependency-free and
 * mirror `applyReaderPrefs` + the clamping above.
 */
export const READER_PREFS_PREPAINT_SCRIPT = `(function () {
  try {
    var raw = localStorage.getItem(${JSON.stringify(READER_PREFS_STORAGE_KEY)});
    if (!raw) return;
    var prefs = JSON.parse(raw);
    if (!prefs || typeof prefs !== "object") return;
    var root = document.documentElement;
    var size = Math.round(Number(prefs.fontSize));
    if (size >= ${READER_MIN_FONT_SIZE} && size <= ${READER_MAX_FONT_SIZE}) {
      root.style.setProperty("--reader-font-size", size + "px");
    }
    if (prefs.font === "sans" || prefs.font === "serif" || prefs.font === "mono") {
      root.dataset.readerFont = prefs.font;
    }
    if (prefs.theme === "light" || prefs.theme === "sepia" || prefs.theme === "dark") {
      root.dataset.readerTheme = prefs.theme;
    }
  } catch (error) {}
})();`;
