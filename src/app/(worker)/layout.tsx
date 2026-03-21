import { DashboardShell } from "@/components/layout/dashboard-shell"

function WorkerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}

export default WorkerLayout
