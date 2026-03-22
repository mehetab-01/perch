/**
 * Verification script for PWA setup.
 * Tests:
 *  1. manifest.json — valid JSON, required fields, icon references
 *  2. Service worker — valid JS, cache strategies, event listeners
 *  3. Icon files — all referenced icons exist
 *  4. Layout meta — manifest link, viewport, theme-color, apple-web-app
 *  5. Install prompt — localStorage dismiss, mobile detection
 *  6. Bottom sheet — drag threshold, body scroll lock
 *  7. Pull-to-refresh — threshold, damping
 *  8. SW register — production-only gate
 *
 * Run: npx tsx scripts/verify-pwa.ts
 */

import fs from "fs"
import path from "path"

let passed = 0
let failed = 0

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log("  ok " + label)
    passed++
  } else {
    console.error("  FAIL " + label)
    failed++
  }
}

const root = process.cwd()
const pub = path.join(root, "public")
const src = path.join(root, "src")

// ═══════════════════════════════════════════
//  1. manifest.json
// ═══════════════════════════════════════════
console.log("\n-- 1. manifest.json --")

const manifestPath = path.join(pub, "manifest.json")
assert(fs.existsSync(manifestPath), "manifest.json exists in /public")

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"))
assert(typeof manifest.name === "string" && manifest.name.length > 0, 'Has "name" field')
assert(typeof manifest.short_name === "string", 'Has "short_name" field')
assert(manifest.display === "standalone", 'display is "standalone"')
assert(manifest.start_url === "/", 'start_url is "/"')
assert(typeof manifest.background_color === "string", "Has background_color")
assert(typeof manifest.theme_color === "string", "Has theme_color")
assert(manifest.theme_color === "#F59E0B", "theme_color is amber (#F59E0B)")
assert(manifest.background_color === "#1C1917", "background_color is dark (#1C1917)")
assert(manifest.orientation === "portrait", "orientation is portrait")

// Icons
assert(Array.isArray(manifest.icons), "Has icons array")
assert(manifest.icons.length >= 4, "At least 4 icons (got " + manifest.icons.length + ")")

const iconSizes = manifest.icons.map((i: { sizes: string }) => i.sizes)
assert(iconSizes.includes("192x192"), "Has 192x192 icon")
assert(iconSizes.includes("512x512"), "Has 512x512 icon")

const maskableIcons = manifest.icons.filter((i: { purpose?: string }) => i.purpose === "maskable")
assert(maskableIcons.length >= 2, "Has maskable icons (got " + maskableIcons.length + ")")

// ═══════════════════════════════════════════
//  2. Icon files exist
// ═══════════════════════════════════════════
console.log("\n-- 2. Icon files --")

for (const icon of manifest.icons) {
  const iconPath = path.join(pub, icon.src)
  assert(fs.existsSync(iconPath), "Icon exists: " + icon.src)
}

const appleTouchIcon = path.join(pub, "icons", "apple-touch-icon.png")
assert(fs.existsSync(appleTouchIcon), "apple-touch-icon.png exists")

const favicon = path.join(pub, "favicon.ico")
assert(fs.existsSync(favicon), "favicon.ico exists")

const svgIcon = path.join(pub, "icons", "icon.svg")
assert(fs.existsSync(svgIcon), "icon.svg source exists")

// ═══════════════════════════════════════════
//  3. Service worker
// ═══════════════════════════════════════════
console.log("\n-- 3. Service worker --")

const swPath = path.join(pub, "sw.js")
assert(fs.existsSync(swPath), "sw.js exists in /public")

const swContent = fs.readFileSync(swPath, "utf-8")
assert(swContent.includes("addEventListener") && swContent.includes('"install"'), "Has install event listener")
assert(swContent.includes('"activate"'), "Has activate event listener")
assert(swContent.includes('"fetch"'), "Has fetch event listener")
assert(swContent.includes("skipWaiting"), "Calls skipWaiting()")
assert(swContent.includes("clients.claim"), "Calls clients.claim()")
assert(swContent.includes("caches.open"), "Uses Cache API")
assert(swContent.includes("NetworkFirst") || swContent.includes("network") || swContent.includes("networkFirstWithTimeout"), "Has network-first strategy")
assert(swContent.includes("CacheFirst") || swContent.includes("caches.match"), "Has cache-first strategy")
assert(swContent.includes("/api/"), "Handles API routes")
assert(swContent.includes("clerk"), "Skips Clerk auth requests")
assert(swContent.includes("/_next/static/"), "Caches Next.js static assets")
assert(swContent.includes("/manifest.json"), "Pre-caches manifest.json")

// ═══════════════════════════════════════════
//  4. Layout metadata
// ═══════════════════════════════════════════
console.log("\n-- 4. Layout metadata --")

const layoutPath = path.join(src, "app", "layout.tsx")
const layout = fs.readFileSync(layoutPath, "utf-8")

assert(layout.includes('manifest: "/manifest.json"'), "Layout links manifest")
assert(layout.includes("themeColor") || layout.includes("theme_color") || layout.includes("theme-color"), "Layout sets theme color")
assert(layout.includes("viewportFit") || layout.includes("viewport-fit"), "Layout has viewport-fit for notched phones")
assert(layout.includes("appleWebApp") || layout.includes("apple-web-app"), "Layout has apple-web-app config")
assert(layout.includes("apple-touch-icon"), "Layout links apple-touch-icon")
assert(layout.includes("InstallPrompt"), "Layout includes InstallPrompt component")
assert(layout.includes("ServiceWorkerRegister"), "Layout includes ServiceWorkerRegister component")

// Viewport export
assert(layout.includes("export const viewport"), "Has exported viewport config")
assert(layout.includes("maximumScale"), "Viewport has maximumScale")

// ═══════════════════════════════════════════
//  5. SW register component
// ═══════════════════════════════════════════
console.log("\n-- 5. SW register --")

const swRegisterPath = path.join(src, "components", "layout", "sw-register.tsx")
assert(fs.existsSync(swRegisterPath), "sw-register.tsx exists")

const swRegister = fs.readFileSync(swRegisterPath, "utf-8")
assert(swRegister.includes('"use client"'), "SW register is a client component")
assert(swRegister.includes("serviceWorker" in navigator ? "serviceWorker" : "serviceWorker"), "Checks for SW support")
assert(swRegister.includes("production"), "Gates registration to production")
assert(swRegister.includes('"/sw.js"'), "Registers /sw.js")
assert(swRegister.includes("updatefound"), "Listens for SW updates")

// ═══════════════════════════════════════════
//  6. Install prompt component
// ═══════════════════════════════════════════
console.log("\n-- 6. Install prompt --")

const installPath = path.join(src, "components", "layout", "install-prompt.tsx")
assert(fs.existsSync(installPath), "install-prompt.tsx exists")

const installPrompt = fs.readFileSync(installPath, "utf-8")
assert(installPrompt.includes('"use client"'), "Install prompt is a client component")
assert(installPrompt.includes("beforeinstallprompt"), "Listens for beforeinstallprompt event")
assert(installPrompt.includes("localStorage"), "Uses localStorage for dismiss tracking")
assert(installPrompt.includes("7 * 24 * 60 * 60") || installPrompt.includes("604800"), "7-day dismiss duration")
assert(installPrompt.includes("Android") || installPrompt.includes("iPhone"), "Detects mobile devices")
assert(installPrompt.includes("prompt()") || installPrompt.includes("deferredPrompt.prompt"), "Triggers install prompt")
assert(installPrompt.includes("userChoice"), "Checks user choice outcome")
assert(installPrompt.includes("Install"), "Has Install button text")
assert(installPrompt.includes("X") || installPrompt.includes("dismiss") || installPrompt.includes("Not now"), "Has dismiss action")

// ═══════════════════════════════════════════
//  7. Bottom sheet component
// ═══════════════════════════════════════════
console.log("\n-- 7. Bottom sheet --")

const bottomSheetPath = path.join(src, "components", "ui", "bottom-sheet.tsx")
assert(fs.existsSync(bottomSheetPath), "bottom-sheet.tsx exists")

const bottomSheet = fs.readFileSync(bottomSheetPath, "utf-8")
assert(bottomSheet.includes('"use client"'), "Bottom sheet is a client component")
assert(bottomSheet.includes("drag") && bottomSheet.includes('"y"'), "Supports vertical drag")
assert(bottomSheet.includes("useDragControls"), "Uses Framer Motion drag controls")
assert(bottomSheet.includes("handleDragEnd"), "Has drag end handler")
assert(bottomSheet.includes("100") || bottomSheet.includes("offset.y"), "Has drag dismiss threshold")
assert(bottomSheet.includes("velocity"), "Considers drag velocity for dismiss")
assert(bottomSheet.includes("overflow") && bottomSheet.includes("hidden"), "Locks body scroll when open")
assert(bottomSheet.includes("Escape"), "Closes on Escape key")
assert(bottomSheet.includes("backdrop-blur"), "Has backdrop blur")
assert(bottomSheet.includes('role="dialog"'), "Has dialog role for a11y")
assert(bottomSheet.includes("aria-modal"), "Has aria-modal for a11y")
assert(bottomSheet.includes("AnimatePresence"), "Uses AnimatePresence for enter/exit")

// Drag handle
assert(bottomSheet.includes("rounded-full") && bottomSheet.includes("w-10"), "Has visual drag handle indicator")

// ═══════════════════════════════════════════
//  8. Pull-to-refresh component
// ═══════════════════════════════════════════
console.log("\n-- 8. Pull-to-refresh --")

const ptrPath = path.join(src, "components", "ui", "pull-to-refresh.tsx")
assert(fs.existsSync(ptrPath), "pull-to-refresh.tsx exists")

const ptr = fs.readFileSync(ptrPath, "utf-8")
assert(ptr.includes('"use client"'), "Pull-to-refresh is a client component")
assert(ptr.includes("onRefresh"), "Accepts onRefresh callback")
assert(ptr.includes("PULL_THRESHOLD"), "Has pull threshold constant")
assert(ptr.includes("MAX_PULL"), "Has max pull limit")
assert(ptr.includes("onTouchStart"), "Handles touch start")
assert(ptr.includes("onTouchMove"), "Handles touch move")
assert(ptr.includes("onTouchEnd"), "Handles touch end")
assert(ptr.includes("scrollTop"), "Checks scroll position before pulling")
assert(ptr.includes("0.5") || ptr.includes("dampened"), "Applies damping to pull distance")
assert(ptr.includes("Loader2"), "Shows loading spinner")
assert(ptr.includes("animate-spin"), "Spinner animates during refresh")
assert(ptr.includes("useMotionValue"), "Uses Framer Motion values for smooth animation")

// ═══════════════════════════════════════════
//  9. PWA installability criteria
// ═══════════════════════════════════════════
console.log("\n-- 9. PWA installability criteria (Chrome) --")

// Chrome requires: manifest with name, icons (192+512), start_url, display; and a service worker
assert(
  manifest.name && manifest.icons.length >= 2 && manifest.start_url && manifest.display,
  "Manifest has all required fields for installability"
)

const has192 = manifest.icons.some((i: { sizes: string }) => i.sizes === "192x192")
const has512 = manifest.icons.some((i: { sizes: string }) => i.sizes === "512x512")
assert(has192 && has512, "Has both 192x192 and 512x512 icons (Chrome requirement)")
assert(fs.existsSync(swPath), "Service worker file exists (Chrome requirement)")

// Verify icons are valid PNGs (check magic bytes)
const icon192 = fs.readFileSync(path.join(pub, "icons", "icon-192.png"))
assert(
  icon192[0] === 0x89 && icon192[1] === 0x50 && icon192[2] === 0x4E && icon192[3] === 0x47,
  "icon-192.png is a valid PNG (magic bytes: 89 50 4E 47)"
)

const icon512 = fs.readFileSync(path.join(pub, "icons", "icon-512.png"))
assert(
  icon512[0] === 0x89 && icon512[1] === 0x50 && icon512[2] === 0x4E && icon512[3] === 0x47,
  "icon-512.png is a valid PNG (magic bytes: 89 50 4E 47)"
)

// ═══════════════════════════════════════════
//  10. .gitignore
// ═══════════════════════════════════════════
console.log("\n-- 10. .gitignore --")

const gitignore = fs.readFileSync(path.join(root, ".gitignore"), "utf-8")
assert(gitignore.includes("sw.js.map"), ".gitignore excludes sw.js.map")

// ═══════════════════════════════════════════
//  Summary
// ═══════════════════════════════════════════
console.log("\n==============================")
console.log("  Results: " + passed + " passed, " + failed + " failed")
console.log("==============================\n")

process.exit(failed > 0 ? 1 : 0)
