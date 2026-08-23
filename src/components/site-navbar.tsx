import NextLink from "next/link";

import { ThemeSwitch } from "@/components/theme-switch";
import { siteConfig } from "@/lib/site";

function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      height="13"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width="13"
    >
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

export function SiteNavbar() {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-separator bg-background/75 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-6">
        <NextLink className="group flex items-baseline gap-3" href="/">
          <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
            Asyraf
          </span>
          <span className="hidden font-mono text-xs text-muted transition-colors group-hover:text-accent sm:inline">
            {siteConfig.domain}
          </span>
        </NextLink>

        <div className="flex items-center gap-1">
          <a
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:bg-default-soft hover:text-foreground"
            href={siteConfig.studioUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Studio
            <ExternalIcon />
          </a>
          <ThemeSwitch />
        </div>
      </div>
    </nav>
  );
}
