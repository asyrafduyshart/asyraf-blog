export type JournalSite = "journal" | "blog";

export type SiteLink = {
  href: string;
  label: string;
  external?: boolean;
};

export const crossDomainLinks: readonly SiteLink[] = [
  { href: "https://asyraf.ai/", label: "Journal" },
  { href: "https://blog.asyraf.ai/", label: "Tulisan" },
  { href: "https://asyraf.ai/#building", label: "Building" },
  {
    href: "https://x.com/asyrafduyshart",
    label: "@asyrafduyshart ↗",
    external: true,
  },
];

export const journalIndexLinks: readonly SiteLink[] = [
  { href: "#about", label: "About" },
  { href: "#building", label: "Building" },
  { href: "#lanes", label: "Lanes" },
  { href: "#writing", label: "Writing" },
];

export const blogIndexLinks: readonly SiteLink[] = [
  { href: "/kategori", label: "Semua" },
  { href: "/kategori/agent", label: "Agent" },
  { href: "/kategori/ai-image", label: "AI Image" },
  { href: "/kategori/keputusan", label: "Keputusan" },
  { href: "/kategori/second-brain", label: "Second brain" },
];

export const hereLinks: readonly SiteLink[] = [
  { href: "https://asyraf.ai/", label: "Journal" },
  { href: "https://blog.asyraf.ai/", label: "Tulisan" },
  { href: "https://asyraf.ai/#building", label: "Building" },
  { href: "https://blog.asyraf.ai/feed.xml", label: "RSS" },
];

export const elsewhereLinks: readonly SiteLink[] = [
  { href: "https://jualan.ai/", label: "jualan.ai", external: true },
  { href: "https://imajinyata.com/", label: "Imaji", external: true },
  {
    href: "https://x.com/asyrafduyshart",
    label: "X @asyrafduyshart",
    external: true,
  },
  {
    href: "https://www.threads.net/@asyraf.ai",
    label: "Threads @asyraf.ai",
    external: true,
  },
  {
    href: "https://www.instagram.com/asyraf.ai/",
    label: "Instagram @asyraf.ai",
    external: true,
  },
  {
    href: "https://github.com/asyrafduyshart",
    label: "GitHub",
    external: true,
  },
];
