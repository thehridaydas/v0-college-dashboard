import { DashboardShell } from "@/components/layout/dashboard-shell"
import { TablePageSkeleton } from "@/components/ui/skeletons"

export default function StudentsLoading() {
  return (
    <DashboardShell pageTitle="Students">
      <TablePageSkeleton statCount={4} cols={5} rows={10} />
    </DashboardShell>
  )
}
