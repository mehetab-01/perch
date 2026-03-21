import { Navbar } from "@/components/layout/navbar"
import { PageTransition } from "@/components/layout/page-transition"

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <PageTransition>{children}</PageTransition>
    </>
  )
}

export { PublicLayout as default }
