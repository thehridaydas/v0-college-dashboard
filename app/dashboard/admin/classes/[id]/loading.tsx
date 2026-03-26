import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { TableSkeleton } from "@/components/ui/skeletons"

export default function ClassDetailLoading() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-4 h-full">
        {/* Back button + title */}
        <div className="flex items-center gap-3 shrink-0">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3.5 w-32" />
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="w-7 h-7 rounded-lg" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-7 w-12 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 shrink-0">
          {["Students", "Teachers", "Subjects"].map((t) => (
            <Skeleton key={t} className="h-9 w-24 rounded-md" />
          ))}
        </div>

        {/* Table */}
        <TableSkeleton rows={8} cols={4} />
      </div>
    </DashboardShell>
  )
}
