/**
 * Sanity project configuration.
 *
 * The project id and dataset are public values (they are visible in every
 * API request the browser makes), so they ship with safe defaults and can
 * be overridden through environment variables — see `.env.example`.
 */
export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "1cml7kb6";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

/**
 * Hard-coded API version (UTC date this integration was wired up).
 * Bump deliberately when you want to opt into newer GROQ/API behavior.
 */
export const apiVersion = "2026-08-23";
