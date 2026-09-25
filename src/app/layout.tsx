import type { Metadata } from "next";
import { Architects_Daughter, Fraunces, Karla } from "next/font/google";

import "./globals.css";

import { SiteFooter } from "../../components/shared/SiteFooter";
import { SiteHeader } from "../../components/shared/SiteHeader";
import { ThemeSwitch } from "@/components/theme-switch";
import { READER_PREFS_PREPAINT_SCRIPT } from "@/lib/reader-prefs";
import { siteConfig } from "@/lib/site";

import { Providers } from "./providers";

const karla = Karla({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
  variable: "--font-serif",
  display: "swap",
});

const architectsDaughter = Architects_Daughter({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sketch",
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
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-default.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      className={`${karla.variable} ${fraunces.variable} ${architectsDaughter.variable}`}
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
          <SiteHeader site="blog" tools={<ThemeSwitch />} />
          <main className="flex-1" id="main-content">
            {children}
          </main>
          <SiteFooter site="blog" />
        </Providers>
      </body>
    </html>
  );
}
