import { DashboardShell } from "@/components/layout/dashboard-shell"
import { TablePageSkeleton } from "@/components/ui/skeletons"

export default function SubjectsLoading() {
  return (
    <DashboardShell pageTitle="Subjects">
      <TablePageSkeleton statCount={3} cols={5} rows={10} />
    </DashboardShell>
  )
}
