function getBaseUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!siteUrl) return "http://localhost:3000";
  return siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;
}

export default function sitemap() {
  const baseUrl = getBaseUrl();

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
