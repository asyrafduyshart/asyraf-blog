import {
  elsewhereLinks,
  hereLinks,
  type JournalSite,
  type SiteLink,
} from "../../design/site-links";
import Wordmark from "./Wordmark";

type SiteFooterProps = {
  site: JournalSite;
};

function FooterList({
  label,
  links,
}: {
  label: string;
  links: readonly SiteLink[];
}) {
  return (
    <nav aria-label={label}>
      <p className="ay-footer-heading">{label}</p>
      <ul className="ay-footer-links">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
            >
              {link.label}
              {link.external ? (
                <span className="ay-sr-only"> (opens in a new tab)</span>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function SiteFooter({ site }: SiteFooterProps) {
  return (
    <footer className="ay-footer">
      <div className="ay-shell ay-footer-grid">
        <div className="ay-footer-intro">
          <a
            className="ay-wordmark-link"
            href="https://asyraf.ai/"
            aria-label="asyraf.ai home"
          >
            <Wordmark />
          </a>
          <p className="ay-footer-summary">
            Personal field journal for Asyraf Duyshart. BSD. Roast tools. Ship
            anyway.
          </p>
        </div>

        <div className="ay-footer-navs">
          <FooterList label="Di sini / Here" links={hereLinks} />
          <FooterList label="Di luar / Elsewhere" links={elsewhereLinks} />
        </div>

        <div className="ay-footer-colophon">
          <p>
            Made with paper grain
            <br />
            and stubborn taste.
          </p>
          <p className="ay-footer-stamp">BSD · 06°18′S</p>
          {site === "blog" ? (
            <a className="ay-back-to-top" href="#top">
              Kembali ke atas ↑
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
