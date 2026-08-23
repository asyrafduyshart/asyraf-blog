import NextLink from "next/link";

export default function NotFound() {
  return (
    <div className="hero-surface flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-xs font-semibold tracking-[0.35em] text-muted uppercase">
        404
      </p>
      <h1 className="mt-4 font-heading text-4xl leading-[1.05] font-medium tracking-tight text-balance sm:text-5xl">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-4 max-w-md text-lg leading-8 text-muted">
        Tautan yang kamu buka mungkin sudah dipindahkan atau tidak pernah ada.
      </p>
      <NextLink
        className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        href="/"
      >
        <span aria-hidden>←</span>
        Kembali ke beranda
      </NextLink>
    </div>
  );
}
