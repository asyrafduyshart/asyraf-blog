"use client";

import { Minus, Plus } from "lucide-react";
import { useId } from "react";

import {
  READER_MAX_FONT_SIZE,
  READER_MIN_FONT_SIZE,
  type ReaderFont,
  type ReaderPrefs,
  type ReaderTheme,
} from "@/lib/reader-prefs";

import type { ReaderLabels } from "./reader-labels";

interface ThemeSwatch {
  value: ReaderTheme;
  label: string;
  background: string;
  foreground: string;
  border: string;
}

const FONT_PREVIEWS: Record<ReaderFont, string> = {
  sans: "var(--font-sans)",
  serif: "var(--font-reading)",
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
};

export function ReaderSettings({
  labels,
  prefs,
  onChange,
  onClose,
}: {
  labels: ReaderLabels;
  prefs: ReaderPrefs;
  onChange: (patch: Partial<ReaderPrefs>) => void;
  onClose: () => void;
}) {
  const sliderId = useId();

  const fonts: Array<{ value: ReaderFont; label: string }> = [
    { value: "sans", label: labels.fontSans },
    { value: "serif", label: labels.fontSerif },
    { value: "mono", label: labels.fontMono },
  ];

  const themes: ThemeSwatch[] = [
    {
      value: "light",
      label: labels.themeLight,
      background: "oklch(0.995 0 0)",
      foreground: "oklch(0.145 0 0)",
      border: "oklch(0.885 0 0)",
    },
    {
      value: "sepia",
      label: labels.themeSepia,
      background: "oklch(0.955 0.023 90)",
      foreground: "oklch(0.32 0.04 65)",
      border: "oklch(0.86 0.032 88)",
    },
    {
      value: "dark",
      label: labels.themeDark,
      background: "oklch(0.185 0 0)",
      foreground: "oklch(0.93 0 0)",
      border: "oklch(0.35 0 0)",
    },
  ];

  return (
    <>
      {/* Invisible click-away layer under the panel. */}
      <button
        aria-hidden
        className="fixed inset-0 z-10 cursor-default"
        tabIndex={-1}
        type="button"
        onClick={onClose}
      />

      <div
        aria-label={labels.settings}
        className="reader-panel absolute inset-x-0 top-full z-20 border-b border-(--reader-border) bg-(--reader-bg) shadow-lg shadow-black/5"
        role="group"
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-5 px-6 py-5">
          {/* Text size */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <label
              className="w-24 shrink-0 text-xs font-medium tracking-wide text-(--reader-muted) uppercase"
              htmlFor={sliderId}
            >
              {labels.textSize}
            </label>
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <button
                aria-label={labels.decrease}
                className="reader-icon-btn shrink-0"
                disabled={prefs.fontSize <= READER_MIN_FONT_SIZE}
                type="button"
                onClick={() => onChange({ fontSize: prefs.fontSize - 1 })}
              >
                <Minus aria-hidden size={16} />
              </button>
              <input
                className="reader-slider h-1.5 min-w-0 flex-1"
                id={sliderId}
                max={READER_MAX_FONT_SIZE}
                min={READER_MIN_FONT_SIZE}
                step={1}
                type="range"
                value={prefs.fontSize}
                onChange={(event) =>
                  onChange({ fontSize: Number(event.target.value) })
                }
              />
              <button
                aria-label={labels.increase}
                className="reader-icon-btn shrink-0"
                disabled={prefs.fontSize >= READER_MAX_FONT_SIZE}
                type="button"
                onClick={() => onChange({ fontSize: prefs.fontSize + 1 })}
              >
                <Plus aria-hidden size={16} />
              </button>
              <span className="w-10 shrink-0 text-right text-xs tabular-nums text-(--reader-muted)">
                {prefs.fontSize}px
              </span>
            </div>
          </div>

          {/* Font family */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="w-24 shrink-0 text-xs font-medium tracking-wide text-(--reader-muted) uppercase">
              {labels.font}
            </span>
            <div className="flex flex-wrap gap-2">
              {fonts.map((font) => (
                <button
                  aria-pressed={prefs.font === font.value}
                  className="reader-pill"
                  key={font.value}
                  style={{ fontFamily: FONT_PREVIEWS[font.value] }}
                  type="button"
                  onClick={() => onChange({ font: font.value })}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme — tapping the active swatch reverts to the site theme. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="w-24 shrink-0 text-xs font-medium tracking-wide text-(--reader-muted) uppercase">
              {labels.theme}
            </span>
            <div className="flex gap-4">
              {themes.map((theme) => {
                const active = prefs.theme === theme.value;

                return (
                  <button
                    aria-pressed={active}
                    className="reader-swatch group flex flex-col items-center gap-1.5"
                    key={theme.value}
                    type="button"
                    onClick={() =>
                      onChange({ theme: active ? null : theme.value })
                    }
                  >
                    <span
                      className={
                        active
                          ? "flex size-9 items-center justify-center rounded-full border text-sm font-semibold ring-2 ring-accent ring-offset-2 ring-offset-(--reader-bg)"
                          : "flex size-9 items-center justify-center rounded-full border text-sm font-semibold"
                      }
                      style={{
                        background: theme.background,
                        color: theme.foreground,
                        borderColor: theme.border,
                      }}
                    >
                      A
                    </span>
                    <span
                      className={
                        active
                          ? "text-xs font-medium text-accent"
                          : "text-xs text-(--reader-muted) transition-colors group-hover:text-(--reader-fg)"
                      }
                    >
                      {theme.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
