import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";

import "./globals.css";

import { SiteNavbar } from "@/components/site-navbar";
import { siteConfig } from "@/lib/site";

import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    siteName: siteConfig.domain,
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      className={`${inter.variable} ${newsreader.variable}`}
      lang={siteConfig.defaultLanguage}
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col bg-background font-sans text-foreground antialiased">
        <Providers>
          <SiteNavbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-separator">
            <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted sm:flex-row">
              <p>
                © {new Date().getFullYear()} {siteConfig.name} ·{" "}
                {siteConfig.domain}
              </p>
              <p className="flex items-center gap-1.5">
                Konten dikelola di{" "}
                <a
                  className="font-medium text-foreground underline decoration-accent/50 underline-offset-4 transition-colors hover:text-accent"
                  href={siteConfig.studioUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Sanity Studio
                </a>
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
