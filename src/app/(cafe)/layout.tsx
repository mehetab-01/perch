import { PageTransition } from "@/components/layout/page-transition"

function CafeLayout({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>
}

export { CafeLayout as default }
