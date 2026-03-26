import { DashboardShell } from "@/components/layout/dashboard-shell"
import { TablePageSkeleton } from "@/components/ui/skeletons"

export default function FeesLoading() {
  return (
    <DashboardShell pageTitle="Fees">
      <TablePageSkeleton statCount={4} cols={6} rows={10} />
    </DashboardShell>
  )
}
