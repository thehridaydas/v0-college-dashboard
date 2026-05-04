// Auth + role guard is handled by middleware — no async work here, renders instantly
import { DashboardShell } from "@/components/layout/dashboard-shell"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  )
}
