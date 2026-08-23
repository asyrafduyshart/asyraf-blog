"use client";

import { useCallback, useEffect, useState } from "react";

import {
  applyReaderPrefs,
  clampReaderFontSize,
  parseReaderPrefs,
  persistReaderPrefs,
  READER_PREFS_STORAGE_KEY,
  readStoredReaderPrefs,
  type ReaderPrefs,
} from "@/lib/reader-prefs";

/**
 * Reading-mode preferences hook, ported from F15's `use-reader-prefs.ts`:
 * loads stored prefs, clamps every update, persists to localStorage,
 * reflects onto <html>, and follows changes from other tabs.
 *
 * Prefs are read lazily on first client render. That's hydration-safe
 * because nothing in the initial tree renders them — the settings panel
 * only mounts after user interaction; the reader surface itself styles
 * via the <html> attributes set by the pre-paint script.
 */
export function useReaderPrefs() {
  const [prefs, setPrefs] = useState<ReaderPrefs>(readStoredReaderPrefs);

  useEffect(() => {
    applyReaderPrefs(prefs);
    persistReaderPrefs(prefs);
  }, [prefs]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== READER_PREFS_STORAGE_KEY) return;
      setPrefs(parseReaderPrefs(event.newValue));
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const updatePrefs = useCallback((patch: Partial<ReaderPrefs>) => {
    setPrefs((current) => {
      const next: ReaderPrefs = { ...current, ...patch };
      next.fontSize = clampReaderFontSize(next.fontSize);
      return next;
    });
  }, []);

  return { prefs, updatePrefs };
}
