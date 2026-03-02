import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vocura.no";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/personvern", "/vilkar", "/docs", "/databehandleravtale"],
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
