function getBaseUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!siteUrl) return "http://localhost:3000";
  return siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;
}

export default function robots() {
  const baseUrl = getBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
