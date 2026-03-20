"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils/cn"

const navLinks = [
  { label: "Search", href: "/search" },
  { label: "For Cafes", href: "/for-cafes" },
  { label: "About", href: "/about" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-perch-dark/80 backdrop-blur-lg",
        "supports-[backdrop-filter]:bg-perch-dark/60"
      )}
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-white font-display"
          aria-label="Perch home"
        >
          perch
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded text-sm text-neutral-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/sign-in"
            className={cn(
              "rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white transition-colors",
              "hover:border-white/30 hover:bg-white/5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-perch-dark"
            )}
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className={cn(
              "rounded-lg bg-perch-primary-500 px-4 py-2 text-sm font-semibold text-black transition-colors",
              "hover:bg-perch-primary-400",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-perch-dark"
            )}
          >
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-white/10 bg-perch-dark/95 backdrop-blur-lg md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-neutral-300 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400"
                >
                  {link.label}
                </Link>
              ))}

              <div className="my-2 h-px bg-white/10" />

              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileOpen(false)}
                className="mt-1 rounded-lg bg-perch-primary-500 px-3 py-2.5 text-center text-sm font-semibold text-black transition-colors hover:bg-perch-primary-400"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
