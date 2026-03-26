import { DashboardShell } from "@/components/layout/dashboard-shell"
import { NoticesSkeleton } from "@/components/ui/skeletons"

export default function NoticesLoading() {
  return (
    <DashboardShell pageTitle="Notices">
      <NoticesSkeleton count={4} />
    </DashboardShell>
  )
}
