/// <reference lib="webworker" />

const CACHE_NAME = "perch-v1"
const STATIC_CACHE = "perch-static-v1"

const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
]

// Install — cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// Fetch — network-first for API/pages, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") return

  // Skip Clerk auth requests
  if (url.hostname.includes("clerk")) return

  // Skip Chrome extension requests
  if (url.protocol === "chrome-extension:") return

  // API routes: network-first with 10s timeout
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      networkFirstWithTimeout(request, "perch-api-v1", 10000)
    )
    return
  }

  // Static assets (images, fonts, JS, CSS): cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(png|jpg|jpeg|webp|svg|gif|ico|woff2?|ttf|css|js)$/i)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone))
          }
          return response
        })
      })
    )
    return
  }

  // Pages: network-first
  event.respondWith(
    networkFirstWithTimeout(request, CACHE_NAME, 10000)
  )
})

async function networkFirstWithTimeout(request, cacheName, timeout) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(request, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (response.ok) {
      const clone = response.clone()
      const cache = await caches.open(cacheName)
      cache.put(request, clone)
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    return new Response("Offline", { status: 503, statusText: "Service Unavailable" })
  }
}
