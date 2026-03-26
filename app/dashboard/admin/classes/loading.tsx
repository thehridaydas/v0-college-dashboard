import { DashboardShell } from "@/components/layout/dashboard-shell"
import { PageHeaderSkeleton, StatCardsSkeleton, ClassCardsSkeleton } from "@/components/ui/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

export default function ClassesLoading() {
  return (
    <DashboardShell pageTitle="Classes">
      <div className="flex flex-col gap-4 h-full">
        <PageHeaderSkeleton />
        <StatCardsSkeleton count={4} />
        <Skeleton className="h-9 w-full" />
        <ClassCardsSkeleton count={8} />
      </div>
    </DashboardShell>
  )
}
