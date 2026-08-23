import type { PostLanguage } from "@/sanity/types";

const LOCALES: Record<PostLanguage, string> = {
  id: "id-ID",
  en: "en-US",
};

export function formatDate(
  date: string | undefined,
  language: PostLanguage = "id",
): string | null {
  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;

  return new Intl.DateTimeFormat(LOCALES[language] ?? LOCALES.id, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

export function readingTimeLabel(
  minutes: number,
  language: PostLanguage = "id",
): string {
  const rounded = Math.max(1, Math.round(minutes));
  return language === "en" ? `${rounded} min read` : `${rounded} menit baca`;
}

export function languageLabel(language: PostLanguage = "id"): string {
  return language === "en" ? "English" : "Bahasa Indonesia";
}
