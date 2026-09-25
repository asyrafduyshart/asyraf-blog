import type { ReactNode } from "react";

import { blogLinks, journalLinks, primaryLinks } from "../../design/site-links";

import { Wordmark } from "./Wordmark";

export function SiteHeader({
  site,
  folio,
  tools,
}: {
  site: "journal" | "blog";
  folio?: string;
  tools?: ReactNode;
}) {
  const indexLinks = site === "blog" ? blogLinks : journalLinks;

  return (
    <header className="ay-masthead">
      <a className="ay-skip" href="#main-content">
        Lewati ke isi
      </a>
      <div className="ay-shell ay-masthead__row">
        <Wordmark section={site === "blog" ? "tulisan" : undefined} />
        <p className="ay-masthead__strap">Personal field journal · BSD</p>
        <nav className="ay-primary-nav" aria-label="Lintas situs">
          <ul>
            {primaryLinks.map((link) => {
              const current =
                (site === "journal" && link.id === "journal") ||
                (site === "blog" && link.id === "blog");
              const external = "external" in link && link.external;
              return (
                <li key={link.label}>
                  <a
                    aria-current={current ? "page" : undefined}
                    href={link.href}
                    rel={external ? "noopener noreferrer" : undefined}
                    target={external ? "_blank" : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <div className="ay-index">
        <div className="ay-shell ay-index__inner">
          <nav aria-label={site === "blog" ? "Kategori tulisan" : "Indeks"}>
            <ul>
              {indexLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <span className="ay-index__folio">
            {folio ?? (site === "blog" ? "Tulisan" : "No. 01 / 2026")}
            {tools}
          </span>
        </div>
      </div>
    </header>
  );
}
