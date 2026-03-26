import { DashboardShell } from "@/components/layout/dashboard-shell"
import { DashboardOverviewSkeleton } from "@/components/ui/skeletons"

export default function AnalyticsLoading() {
  return (
    <DashboardShell pageTitle="Analytics">
      <DashboardOverviewSkeleton />
    </DashboardShell>
  )
}
