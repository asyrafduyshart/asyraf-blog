import NextLink from "next/link";

export default function NotFound() {
  return (
    <div className="hero-surface flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-mono text-xs tracking-[0.35em] text-accent uppercase">
        404
      </p>
      <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-4 max-w-md text-lg leading-8 text-muted">
        Tautan yang kamu buka mungkin sudah dipindahkan atau tidak pernah ada.
      </p>
      <NextLink
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        href="/"
      >
        <span aria-hidden>←</span>
        Kembali ke beranda
      </NextLink>
    </div>
  );
}
