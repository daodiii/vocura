import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mediscribe.no";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/personvern", "/vilkar"],
        disallow: [
          "/api/",
          "/dashboard/",
          "/dictation/",
          "/journal/",
          "/editor/",
          "/forms/",
          "/summary/",
          "/templates/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
