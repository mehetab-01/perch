import { Navbar } from "@/components/layout/navbar"

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

export default PublicLayout
