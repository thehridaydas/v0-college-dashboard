import { PageHeaderSkeleton, ClassCardsSkeleton } from "@/components/ui/skeletons"

export default function ClassesLoading() {
  return (
    <div className="flex flex-col gap-4 h-full">
      <PageHeaderSkeleton />
      <ClassCardsSkeleton count={12} />
    </div>
  )
}
