import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/design/",
          "/channels/",
          "/publish/",
          "/billing/",
          "/workspaces/",
        ],
      },
    ],
    sitemap: "https://odesigns.app/sitemap.xml",
  };
}
