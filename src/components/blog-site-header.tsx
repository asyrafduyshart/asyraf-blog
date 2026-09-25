"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";

import SiteHeader from "@/components/shared/SiteHeader";
import { ThemeSwitch } from "@/components/theme-switch";
import type { SiteLink } from "@/design/site-links";

type ArticleContext = {
  category?: SiteLink;
  isArticle: boolean;
  pathname: string;
};

type ProgressState = {
  pathname: string;
  value: number;
};

function getReadingProgress() {
  const scrollable =
    document.documentElement.scrollHeight - window.innerHeight;
  return scrollable > 0 ? window.scrollY / scrollable : 0;
}

export function BlogSiteHeader() {
  const pathname = usePathname();
  const [articleContext, setArticleContext] = useState<ArticleContext>({
    isArticle: false,
    pathname: "",
  });
  const [progress, setProgress] = useState<ProgressState>({
    pathname: "",
    value: 0,
  });
  const articleCategory =
    articleContext.pathname === pathname ? articleContext.category : undefined;
  const articleMode =
    articleContext.pathname === pathname && articleContext.isArticle;
  const readingProgress = progress.pathname === pathname ? progress.value : 0;

  useEffect(() => {
    let frame = 0;
    const main = document.querySelector("#main-content");

    const syncArticleContext = () => {
      const article = document.querySelector<HTMLElement>(
        "article[data-article-page]",
      );
      const matchesPath = article?.dataset.articlePath === pathname;
      const label = article?.dataset.articleCategoryLabel;
      const href = article?.dataset.articleCategoryHref;
      setArticleContext({
        category: matchesPath && label && href ? { href, label } : undefined,
        isArticle: matchesPath,
        pathname,
      });
      if (matchesPath) observer.disconnect();
    };

    const observer = new MutationObserver(() => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(syncArticleContext);
    });
    if (main) observer.observe(main, { childList: true, subtree: true });
    frame = window.requestAnimationFrame(syncArticleContext);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  useEffect(() => {
    if (!articleMode) return;

    const updateProgress = () => {
      const value = Math.round(getReadingProgress() * 1000) / 1000;
      setProgress((current) =>
        current.pathname === pathname && current.value === value
          ? current
          : { pathname, value },
      );
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [articleMode, pathname]);

  useLayoutEffect(() => {
    document.querySelectorAll<HTMLAnchorElement>(".ay-index-link").forEach(
      (link) => {
        const linkPath = new URL(link.href, window.location.origin).pathname;
        const current =
          linkPath === pathname ||
          (pathname === "/" && linkPath === "/kategori");
        if (current) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      },
    );
  }, [pathname, articleMode]);

  return (
    <SiteHeader
      articleCategory={articleCategory}
      articleMode={articleMode}
      indexAction={<ThemeSwitch />}
      readingProgress={readingProgress}
      site="blog"
    />
  );
}
