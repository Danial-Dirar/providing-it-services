/**
 * Environment resolution that works both on a plain Node server and on Vercel.
 *
 * Vercel sets NODE_ENV=production for preview deployments too, so NODE_ENV
 * alone cannot tell "the real site" from "a branch preview". VERCEL_ENV can,
 * and it is the value that decides whether robots.txt invites crawlers.
 */
export function isProductionEnv(): boolean {
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === 'production';
  return process.env.NODE_ENV === 'production';
}

/**
 * Absolute origin used for canonical tags, OG URLs, JSON-LD and the sitemap.
 *
 * SITE_URL wins when set (production). Preview deployments fall back to the
 * deployment's own hostname so their canonicals point at themselves rather
 * than at the live site.
 */
export function resolveSiteUrl(): string {
  const explicit = process.env.SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT || 3100}`;
}
