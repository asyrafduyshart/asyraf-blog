"use client";

import { Check, Copy, SquareTerminal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { PostLanguage, PromptSnippetBlock } from "@/sanity/types";

const FEEDBACK_MS = 2000;
const CLIPBOARD_TIMEOUT_MS = 1500;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(
      () => reject(new Error("clipboard timeout")),
      ms,
    );
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    );
  });
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      // The timeout guards against permission prompts that never settle
      // (seen in some embedded/automation browsers); we then fall back.
      await withTimeout(navigator.clipboard.writeText(text), CLIPBOARD_TIMEOUT_MS);
      return true;
    }
  } catch {
    // Clipboard API unavailable or denied — try the legacy path below.
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
}

/**
 * Copyable prompt card for `promptSnippet` body blocks: title bar +
 * monospace preview + primary copy button with brief "copied" feedback.
 *
 * `variant="post"` uses the site design tokens; `variant="reader"` uses
 * the `--reader-*` variables so the card follows the reading-mode theme.
 */
export function PromptSnippetCard({
  snippet,
  language = "id",
  variant = "post",
}: {
  snippet: PromptSnippetBlock;
  language?: PostLanguage;
  variant?: "post" | "reader";
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const code = snippet.code ?? "";
  if (code.trim().length === 0) return null;

  const isEnglish = language === "en";
  const title =
    snippet.title && snippet.title.trim().length > 0 ? snippet.title : "Prompt";
  const labels = {
    copy: isEnglish ? "Copy prompt" : "Salin prompt",
    copied: isEnglish ? "Copied" : "Tersalin",
    error: isEnglish ? "Copy failed" : "Gagal menyalin",
    region: isEnglish ? "Prompt snippet" : "Cuplikan prompt",
  };

  const isReader = variant === "reader";

  const onCopy = async () => {
    const copied = await copyText(code);
    setStatus(copied ? "copied" : "error");

    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = window.setTimeout(() => {
      setStatus("idle");
      resetTimerRef.current = null;
    }, FEEDBACK_MS);
  };

  return (
    <section
      aria-label={`${labels.region}: ${title}`}
      className={
        isReader
          ? "my-[1.6em] overflow-hidden rounded-[0.625rem] border border-(--reader-border)"
          : "my-10 overflow-hidden rounded-lg border border-border bg-surface sm:my-12"
      }
    >
      <div
        className={
          isReader
            ? "flex items-center justify-between gap-3 border-b border-(--reader-border) px-4 py-3 sm:px-5"
            : "flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5"
        }
      >
        <p
          className={
            isReader
              ? "flex min-w-0 items-center gap-2 text-sm font-medium text-(--reader-fg)"
              : "flex min-w-0 items-center gap-2 font-sans text-sm font-medium text-foreground"
          }
        >
          <SquareTerminal
            aria-hidden
            className="shrink-0 text-accent"
            size={16}
            strokeWidth={2}
          />
          <span className="truncate">{title}</span>
        </p>

        <button
          className={
            status === "idle"
              ? "inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-accent px-4 font-sans text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              : "inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-accent/15 px-4 font-sans text-sm font-medium text-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          }
          type="button"
          onClick={onCopy}
        >
          {status === "copied" ? (
            <Check aria-hidden size={15} strokeWidth={2.25} />
          ) : (
            <Copy aria-hidden size={15} strokeWidth={2} />
          )}
          <span aria-live="polite">
            {status === "idle"
              ? labels.copy
              : status === "copied"
                ? labels.copied
                : labels.error}
          </span>
        </button>
      </div>

      <pre
        className={
          isReader
            ? "max-h-80 overflow-auto px-4 py-4 font-mono text-[0.72em] leading-relaxed whitespace-pre-wrap text-(--reader-muted) sm:px-5"
            : "max-h-80 overflow-auto px-4 py-4 font-mono text-[0.8125rem] leading-relaxed whitespace-pre-wrap text-foreground/75 sm:px-5"
        }
      >
        {code}
      </pre>
    </section>
  );
}
