import type { MetadataRoute } from "next"

function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/bookings", "/cafe-dashboard", "/admin", "/api"],
      },
    ],
    sitemap: "https://getperch.in/sitemap.xml",
  }
}

export { robots as default }
