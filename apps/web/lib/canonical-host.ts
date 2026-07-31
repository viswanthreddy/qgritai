const VERCEL_PRODUCTION_ALIAS = "qgritai.vercel.app";
const CANONICAL_HOST = "qgritai.com";

export function getCanonicalRedirectUrl(requestUrl: URL, configuredSiteUrl: string | undefined) {
  if (requestUrl.hostname !== VERCEL_PRODUCTION_ALIAS || requestUrl.pathname.startsWith("/api/") || !configuredSiteUrl) return null;

  try {
    const canonical = new URL(configuredSiteUrl);
    if (canonical.protocol !== "https:" || canonical.hostname !== CANONICAL_HOST) return null;
    canonical.pathname = requestUrl.pathname;
    canonical.search = requestUrl.search;
    canonical.hash = requestUrl.hash;
    return canonical;
  } catch {
    return null;
  }
}
