import NextLink from "next/link";

import { ThemeSwitch } from "@/components/theme-switch";
import { siteConfig } from "@/lib/site";

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
          <ThemeSwitch />
        </div>
      </div>
    </nav>
  );
}
