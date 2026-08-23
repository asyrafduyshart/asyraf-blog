import type { PostLanguage } from "@/sanity/types";

export interface ReaderLabels {
  close: string;
  settings: string;
  textSize: string;
  decrease: string;
  increase: string;
  font: string;
  fontSans: string;
  fontSerif: string;
  fontMono: string;
  theme: string;
  themeLight: string;
  themeSepia: string;
  themeDark: string;
  previous: string;
  next: string;
  progress: (current: number, total: number) => string;
  readingMode: string;
}

/** Bahasa Indonesia by default (matching F15); English follows the post. */
export function getReaderLabels(language: PostLanguage): ReaderLabels {
  if (language === "en") {
    return {
      close: "Close reading mode",
      settings: "Reader settings",
      textSize: "Text size",
      decrease: "Decrease text size",
      increase: "Increase text size",
      font: "Font",
      fontSans: "Sans",
      fontSerif: "Serif",
      fontMono: "Mono",
      theme: "Theme",
      themeLight: "Light",
      themeSepia: "Sepia",
      themeDark: "Dark",
      previous: "Previous",
      next: "Next",
      progress: (current, total) => `${current} of ${total}`,
      readingMode: "Reading mode",
    };
  }

  return {
    close: "Tutup mode baca",
    settings: "Pengaturan baca",
    textSize: "Ukuran teks",
    decrease: "Perkecil teks",
    increase: "Perbesar teks",
    font: "Jenis huruf",
    fontSans: "Sans",
    fontSerif: "Serif",
    fontMono: "Mono",
    theme: "Tema",
    themeLight: "Terang",
    themeSepia: "Sepia",
    themeDark: "Gelap",
    previous: "Sebelumnya",
    next: "Berikutnya",
    progress: (current, total) => `${current} dari ${total}`,
    readingMode: "Mode baca",
  };
}
