/** Public address of the web app, used for the sitemap and social previews. Set NEXT_PUBLIC_SITE_URL in production. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3101").replace(/\/$/, "");
