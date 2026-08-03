import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Dashboard/admin are authenticated, per-user app views — nothing there is worth (or safe to) index. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/admin"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
