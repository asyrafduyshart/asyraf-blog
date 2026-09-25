import {
  footerElsewhereLinks,
  footerHereLinks,
} from "../../design/site-links";

import { Wordmark } from "./Wordmark";

export function SiteFooter({ site }: { site: "journal" | "blog" }) {
  const resolveHereHref = (href: string) =>
    site === "blog" && href.startsWith("https://blog.asyraf.ai")
      ? href.replace("https://blog.asyraf.ai", "") || "/"
      : href;

  return (
    <footer className="ay-footer">
      <div className="ay-shell ay-footer__grid">
        <div className="ay-footer__intro">
          <Wordmark section={site === "blog" ? "tulisan" : undefined} />
          <p>
            Personal field journal for Asyraf Duyshart. BSD. Roast tools. Ship
            anyway.
          </p>
        </div>
        <div className="ay-footer__links">
          <nav aria-label="Di sini">
            <p className="ay-footer__label">Di sini</p>
            <ul>
              {footerHereLinks.map((link) => (
                <li key={link.label}>
                  <a href={resolveHereHref(link.href)}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Di luar">
            <p className="ay-footer__label">Di luar</p>
            <ul>
              {footerElsewhereLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} rel="noopener noreferrer" target="_blank">
                    {link.label} <span aria-hidden>↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="ay-footer__colophon">
          <p>Made with paper grain / and stubborn taste.</p>
          <span className="ay-footer__stamp">BSD · 06°18′S</span>
          {site === "blog" ? (
            <p>
              <a href="#top">Kembali ke atas ↑</a>
            </p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
