export const siteConfig = {
  name: "Asyraf Duyshart",
  domain: "blog.asyraf.ai",
  url: "https://blog.asyraf.ai",
  title: "Asyraf Duyshart",
  description:
    "Bukan self-help. Lebih ke self-roast yang dibungkus seperti essay.",
  defaultLanguage: "id" as const,
};

/**
 * Public social profiles, rendered by `SocialLinks` (hero + footer).
 * Kept here so the URLs live in exactly one place.
 */
export const socialLinks = [
  {
    id: "x",
    label: "X (Twitter)",
    href: "https://x.com/AsyrafDuyshart",
  },
  {
    id: "threads",
    label: "Threads",
    href: "https://www.threads.net/@asyraf.ai",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/asyraf.ai/",
  },
] as const;

export type SocialLink = (typeof socialLinks)[number];
