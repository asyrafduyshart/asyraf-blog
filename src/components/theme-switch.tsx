"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width="18"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width="18"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

const emptySubscribe = () => () => {};

export function ThemeSwitch() {
  // `true` after hydration only — avoids a server/client markup mismatch,
  // since the resolved theme is unknown during SSR.
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const { resolvedTheme, setTheme } = useTheme();

  if (!isHydrated) {
    return <span aria-hidden className="size-9" />;
  }

  const isLight = resolvedTheme === "light";

  return (
    <button
      aria-label={isLight ? "Aktifkan mode gelap" : "Aktifkan mode terang"}
      className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-default-soft hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      type="button"
      onClick={() => setTheme(isLight ? "dark" : "light")}
    >
      {isLight ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
