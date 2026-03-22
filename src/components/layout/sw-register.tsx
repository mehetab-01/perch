"use client"

import { useEffect } from "react"

function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (!newWorker) return
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "activated" && navigator.serviceWorker.controller) {
                // New service worker activated — could show update banner
                console.log("[Perch] Service worker updated")
              }
            })
          })
        })
        .catch((err) => {
          console.error("[Perch] SW registration failed:", err)
        })
    }
  }, [])

  return null
}

export { ServiceWorkerRegister }
