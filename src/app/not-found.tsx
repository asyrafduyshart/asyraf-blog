import NextLink from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-note text-lg text-[var(--ochre-ink)]">404</p>
      <h1 className="mt-4 font-heading text-[length:var(--step-5)] leading-[1.05] font-semibold tracking-[-.03em] text-balance">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-4 max-w-md text-lg leading-8 text-muted">
        Tautan yang kamu buka mungkin sudah dipindahkan atau tidak pernah ada.
      </p>
      <NextLink
        className="button-solid mt-8"
        href="/"
      >
        <span aria-hidden>←</span>
        Kembali ke beranda
      </NextLink>
    </div>
  );
}
