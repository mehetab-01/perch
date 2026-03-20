import { Twitter, Instagram, Linkedin } from "lucide-react"
import { cn } from "@/lib/utils/cn"

const quickLinks = [
  { label: "Browse Spaces", href: "/search" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "List Your Cafe", href: "/cafe/onboard" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
]

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Refund Policy", href: "/refunds" },
  { label: "Contact", href: "/contact" },
]

const socialLinks = [
  {
    label: "Twitter / X",
    href: "https://twitter.com/perch_in",
    icon: <Twitter className="h-4 w-4" aria-hidden="true" />,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/perch.in",
    icon: <Instagram className="h-4 w-4" aria-hidden="true" />,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/perch-in",
    icon: <Linkedin className="h-4 w-4" aria-hidden="true" />,
  },
]

export function Footer() {
  return (
    <footer
      className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
      role="contentinfo"
    >
      <div className="mx-auto max-w-6xl px-4">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 gap-12 py-16 sm:grid-cols-3 sm:gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white">
                Perch
              </span>
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                Beta
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              The smartest way to book cafe spaces for business meetings. Find your perch, get work done.
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-600">
              Made with care in India.
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label="Quick links">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-950 dark:text-white">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={cn(
                      "text-sm text-neutral-500 transition-colors hover:text-amber-600",
                      "dark:text-neutral-400 dark:hover:text-amber-400"
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal links */}
          <nav aria-label="Legal links">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-950 dark:text-white">
              Legal
            </h3>
            <ul className="flex flex-col gap-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={cn(
                      "text-sm text-neutral-500 transition-colors hover:text-amber-600",
                      "dark:text-neutral-400 dark:hover:text-amber-400"
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div
          className={cn(
            "flex flex-col items-center justify-between gap-4 border-t border-neutral-200 py-8",
            "dark:border-neutral-800",
            "sm:flex-row"
          )}
        >
          <p className="text-xs text-neutral-400 dark:text-neutral-600">
            &copy; {new Date().getFullYear()} Perch Technologies Pvt. Ltd. All rights reserved.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-3" role="list" aria-label="Social media links">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                role="listitem"
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-400 transition-colors",
                  "hover:border-amber-400 hover:text-amber-500",
                  "dark:border-neutral-800 dark:text-neutral-600 dark:hover:border-amber-500 dark:hover:text-amber-400",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                )}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
