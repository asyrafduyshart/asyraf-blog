"use client";

import { useEffect } from "react";

/**
 * Syncs `<html lang>` with the language of the currently displayed post.
 * The root layout renders the site default (`id`); this keeps the attribute
 * accurate when navigating between posts written in different languages.
 */
export function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = lang;

    return () => {
      document.documentElement.lang = previous;
    };
  }, [lang]);

  return null;
}
