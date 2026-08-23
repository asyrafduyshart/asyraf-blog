import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";

import "./globals.css";

import { SiteNavbar } from "@/components/site-navbar";
import { READER_PREFS_PREPAINT_SCRIPT } from "@/lib/reader-prefs";
import { siteConfig } from "@/lib/site";

import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-fraunces",
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
      className={`${inter.variable} ${fraunces.variable}`}
      lang={siteConfig.defaultLanguage}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-dvh flex-col bg-background font-sans text-foreground antialiased"
        id="top"
      >
        {/* Applies stored reading-mode prefs before first paint (no flash). */}
        <script
          dangerouslySetInnerHTML={{ __html: READER_PREFS_PREPAINT_SCRIPT }}
        />
        <Providers>
          <SiteNavbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-10 text-sm text-muted sm:flex-row">
              <p>
                © {new Date().getFullYear()} {siteConfig.name} ·{" "}
                {siteConfig.domain}
              </p>
              <a
                className="rounded-full px-3 py-1.5 transition-colors hover:bg-default-soft hover:text-foreground"
                href="#top"
              >
                Kembali ke atas ↑
              </a>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
