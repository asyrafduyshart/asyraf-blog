import type { ImageLoaderProps } from "next/image";

export default function imageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (!src.startsWith("https://cdn.sanity.io/")) {
    return src;
  }

  const url = new URL(src);
  url.searchParams.set("w", width.toString());
  url.searchParams.set("q", (quality ?? 75).toString());
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");

  return url.toString();
}
