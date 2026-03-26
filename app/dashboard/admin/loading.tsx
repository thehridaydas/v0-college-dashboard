import { DashboardShell } from "@/components/layout/dashboard-shell"
import { DashboardOverviewSkeleton } from "@/components/ui/skeletons"

export default function AdminLoading() {
  return (
    <DashboardShell pageTitle="Dashboard">
      <DashboardOverviewSkeleton />
    </DashboardShell>
  )
}
