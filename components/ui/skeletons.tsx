import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

// ---- Stat cards row (3 or 4 cards) ----
export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-${count} gap-3`}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-4 pb-3">
            <Skeleton className="h-7 w-16 mb-2" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ---- Full-height table skeleton (header + rows) ----
export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <Card className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Search bar skeleton */}
      <div className="px-4 py-3 border-b border-border shrink-0">
        <Skeleton className="h-9 w-full" />
      </div>
      {/* Table header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border shrink-0">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" style={{ maxWidth: i === 0 ? "200px" : "120px" }} />
        ))}
      </div>
      {/* Rows */}
      <div className="flex-1 divide-y divide-border overflow-hidden">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            {/* Avatar + name */}
            <div className="flex items-center gap-3 flex-1" style={{ maxWidth: "200px" }}>
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-2.5 w-20" />
              </div>
            </div>
            {Array.from({ length: cols - 1 }).map((_, j) => (
              <Skeleton key={j} className="h-3 flex-1" style={{ maxWidth: "100px" }} />
            ))}
          </div>
        ))}
      </div>
    </Card>
  )
}

// ---- Page header skeleton ----
export function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between shrink-0">
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-3.5 w-44" />
      </div>
      <Skeleton className="h-9 w-28 rounded-md" />
    </div>
  )
}

// ---- Classes card grid skeleton ----
export function ClassCardsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="h-1 w-full bg-muted" />
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="pt-2 border-t border-border/60">
              <Skeleton className="h-3 w-28" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ---- Dashboard overview skeleton ----
export function DashboardOverviewSkeleton() {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
              <Skeleton className="h-7 w-16 mb-1.5" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Second row stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
              <Skeleton className="h-7 w-16 mb-1.5" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        <Card className="lg:col-span-2">
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-48 w-full mt-4" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-36" />
            <Skeleton className="w-32 h-32 rounded-full mx-auto mt-4" />
            <div className="space-y-2 mt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ---- Notices skeleton ----
export function NoticesSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between shrink-0">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-3.5 w-36" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-12 rounded-full" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ---- Generic table page skeleton (header + stats + table) ----
export function TablePageSkeleton({ statCount = 3, cols = 5, rows = 8 }: { statCount?: number; cols?: number; rows?: number }) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <PageHeaderSkeleton />
      <StatCardsSkeleton count={statCount} />
      <TableSkeleton cols={cols} rows={rows} />
    </div>
  )
}
