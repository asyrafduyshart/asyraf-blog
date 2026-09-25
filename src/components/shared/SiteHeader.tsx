import type { ReactNode } from "react";
import {
  blogIndexLinks,
  crossDomainLinks,
  journalIndexLinks,
  type JournalSite,
  type SiteLink,
} from "../../design/site-links";
import Wordmark from "./Wordmark";

type SiteHeaderProps = {
  site: JournalSite;
  articleCategory?: SiteLink;
  articleMode?: boolean;
  folio?: string;
  indexAction?: ReactNode;
  readingProgress?: number;
};

export default function SiteHeader({
  site,
  articleCategory,
  articleMode = false,
  folio,
  indexAction,
  readingProgress,
}: SiteHeaderProps) {
  const indexLinks = articleMode
    ? [
        { href: "https://blog.asyraf.ai/", label: "← Semua tulisan" },
        ...(articleCategory ? [articleCategory] : []),
      ]
    : site === "journal"
      ? journalIndexLinks
      : blogIndexLinks;

  return (
    <>
      <a className="ay-skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="ay-masthead" id="top">
        <div className="ay-shell ay-masthead-row">
          <a
            className="ay-wordmark-link"
            href="https://asyraf.ai/"
            aria-label={
              site === "blog" ? "asyraf.ai tulisan home" : "asyraf.ai home"
            }
          >
            <Wordmark section={site === "blog" ? "tulisan" : undefined} />
          </a>

          <p className="ay-masthead-kicker">Personal field journal · BSD</p>

          <nav className="ay-site-nav" aria-label="Journal sites">
            {crossDomainLinks.map((link) => {
              const current =
                (site === "journal" && link.label === "Journal") ||
                (site === "blog" && link.label === "Tulisan");

              return (
                <a
                  className="ay-site-link"
                  href={link.href}
                  key={link.href}
                  aria-current={current ? "page" : undefined}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                >
                  {link.label}
                  {link.external ? (
                    <span className="ay-sr-only">
                      {" "}
                      (opens in a new tab)
                    </span>
                  ) : null}
                </a>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="ay-index-wrap">
        <nav className="ay-index ay-shell" aria-label="Page index">
          <span className="ay-index-label" aria-hidden>
            Index
          </span>
          {indexLinks.map((link) => (
            <a className="ay-index-link" href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
          <span className="ay-index-folio" aria-hidden>
            {folio ?? (site === "journal" ? "No. 01 / 2026" : "17 tulisan")}
          </span>
          {indexAction ? (
            <span className="ay-index-action">{indexAction}</span>
          ) : null}
        </nav>
        {articleMode ? (
          <span
            className="ay-reading-progress"
            style={{
              transform: `scaleX(${Math.min(1, Math.max(0, readingProgress ?? 0))})`,
            }}
            aria-hidden
          />
        ) : null}
      </div>
    </>
  );
}
