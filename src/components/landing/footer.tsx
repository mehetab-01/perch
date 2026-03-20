import Link from "next/link"
import { Twitter, Instagram, Linkedin } from "lucide-react"
import { cn } from "@/lib/utils/cn"

const productLinks = [
  { label: "Search Spaces", href: "/search" },
  { label: "List Your Cafe", href: "/for-cafes" },
  { label: "For Companies", href: "/for-companies" },
  { label: "Pricing", href: "/pricing" },
]

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
]

const legalLinks = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Cancellation Policy", href: "/cancellation" },
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

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav aria-label={title}>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-950 dark:text-white">
        {title}
      </h3>
      <ul className="flex flex-col gap-3">{children}</ul>
    </nav>
  )
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "rounded text-sm text-neutral-500 transition-colors hover:text-perch-primary-600",
          "dark:text-neutral-400 dark:hover:text-perch-primary-400",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400"
        )}
      >
        {label}
      </Link>
    </li>
  )
}

export function Footer() {
  return (
    <footer
      className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
      role="contentinfo"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Main grid — 4 columns */}
        <div className="grid grid-cols-2 gap-8 py-16 sm:grid-cols-4 sm:gap-6">
          {/* Brand */}
          <div className="col-span-2 flex flex-col gap-4 sm:col-span-1">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white font-display"
            >
              perch
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              Book meeting-ready cafe spaces in 2 minutes. Find your perch, get work done.
            </p>
            {/* Social */}
            <div className="flex items-center gap-2.5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-400 transition-colors",
                    "hover:border-perch-primary-400 hover:text-perch-primary-500",
                    "dark:border-neutral-800 dark:text-neutral-600 dark:hover:border-perch-primary-500 dark:hover:text-perch-primary-400",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400"
                  )}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <FooterColumn title="Product">
            {productLinks.map((link) => (
              <FooterLink key={link.href} {...link} />
            ))}
          </FooterColumn>

          {/* Company */}
          <FooterColumn title="Company">
            {companyLinks.map((link) => (
              <FooterLink key={link.href} {...link} />
            ))}
          </FooterColumn>

          {/* Legal */}
          <FooterColumn title="Legal">
            {legalLinks.map((link) => (
              <FooterLink key={link.href} {...link} />
            ))}
          </FooterColumn>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-center border-t border-neutral-200 py-8 dark:border-neutral-800">
          <p className="text-xs text-neutral-400 dark:text-neutral-600">
            &copy; 2026 Perch. Made in Mumbai 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  )
}
