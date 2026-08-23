import NextLink from "next/link";

import { ThemeSwitch } from "@/components/theme-switch";
import { siteConfig } from "@/lib/site";

export function SiteNavbar() {
  return (
    <header className="sticky top-0 z-40 w-full">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <NextLink className="focus-visible:outline-none" href="/">
          <span className="flex items-center gap-2 rounded-full border border-border bg-background/80 py-1.5 pr-3 pl-4 backdrop-blur-md select-none">
            <span className="text-lg font-semibold tracking-tight whitespace-nowrap text-foreground">
              {siteConfig.name}
            </span>
            <span className="hidden text-xs font-medium text-muted sm:inline">
              {siteConfig.domain}
            </span>
          </span>
        </NextLink>

        <div className="flex items-center rounded-full border border-border bg-background/80 p-1 backdrop-blur-md">
          <ThemeSwitch />
        </div>
      </nav>
    </header>
  );
}
