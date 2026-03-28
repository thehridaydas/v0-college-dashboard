import { DashboardShell } from "@/components/layout/dashboard-shell"

export default function PrincipalLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  )
}
