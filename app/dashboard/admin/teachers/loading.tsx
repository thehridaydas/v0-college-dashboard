import { DashboardShell } from "@/components/layout/dashboard-shell"
import { TablePageSkeleton } from "@/components/ui/skeletons"

export default function TeachersLoading() {
  return (
    <DashboardShell pageTitle="Teachers">
      <TablePageSkeleton statCount={3} cols={5} rows={10} />
    </DashboardShell>
  )
}
