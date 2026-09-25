import {
  footerElsewhereLinks,
  footerHereLinks,
} from "../../design/site-links";

import { Wordmark } from "./Wordmark";

export function SiteFooter({ site }: { site: "journal" | "blog" }) {
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
          <div>
            <p className="ay-footer__label">Di sini</p>
            <ul>
              {footerHereLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="ay-footer__label">Di luar</p>
            <ul>
              {footerElsewhereLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} rel="noreferrer" target="_blank">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
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
