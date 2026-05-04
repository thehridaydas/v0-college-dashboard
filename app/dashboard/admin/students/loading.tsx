import { TablePageSkeleton } from "@/components/ui/skeletons"

export default function StudentsLoading() {
  return <TablePageSkeleton statCount={3} cols={5} rows={10} />
}
