"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import SiteHeader from "@/components/shared/SiteHeader";
import { ThemeSwitch } from "@/components/theme-switch";
import type { SiteLink } from "@/design/site-links";

type ArticleContext = {
  category?: SiteLink;
  isArticle: boolean;
  pathname: string;
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
  const [readingProgress, setReadingProgress] = useState(0);
  const articleCategory =
    articleContext.pathname === pathname ? articleContext.category : undefined;
  const articleMode =
    articleContext.pathname === pathname && articleContext.isArticle;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const article = document.querySelector<HTMLElement>(
        "article[data-article-page]",
      );
      const label = article?.dataset.articleCategoryLabel;
      const href = article?.dataset.articleCategoryHref;
      setArticleContext({
        category: label && href ? { href, label } : undefined,
        isArticle: Boolean(article),
        pathname,
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (!articleMode) return;

    const updateProgress = () => setReadingProgress(getReadingProgress());
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [articleMode, pathname]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
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
    });

    return () => window.cancelAnimationFrame(frame);
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
