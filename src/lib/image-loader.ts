import type { ImageLoaderProps } from "next/image";

export default function imageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (!src.startsWith("https://cdn.sanity.io/")) {
    const params = new URLSearchParams({
      url: src,
      w: width.toString(),
      q: (quality ?? 75).toString(),
    });
    return `/_next/image?${params.toString()}`;
  }

  const url = new URL(src);
  const sourceWidth = Number(url.searchParams.get("w"));
  const sourceHeight = Number(url.searchParams.get("h"));

  if (sourceWidth > 0 && sourceHeight > 0) {
    url.searchParams.set(
      "h",
      Math.max(1, Math.round((sourceHeight / sourceWidth) * width)).toString(),
    );
  } else {
    url.searchParams.delete("h");
  }

  url.searchParams.set("w", width.toString());
  url.searchParams.set("q", (quality ?? 75).toString());
  url.searchParams.set("auto", "format");
  if (!url.searchParams.has("fit")) {
    url.searchParams.set("fit", "max");
  }

  return url.toString();
}
