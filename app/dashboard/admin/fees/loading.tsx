import { TablePageSkeleton } from "@/components/ui/skeletons"

export default function FeesLoading() {
  return <TablePageSkeleton statCount={4} cols={6} rows={10} />
}
