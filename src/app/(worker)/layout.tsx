import { Suspense } from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { PageTransition } from "@/components/layout/page-transition"

function WorkerLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <DashboardShell>
        <PageTransition>{children}</PageTransition>
      </DashboardShell>
    </Suspense>
  )
}

export { WorkerLayout as default }
