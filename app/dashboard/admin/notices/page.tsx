import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { NoticesClient } from "@/components/shared/notices-client"
import { NoticesSkeleton } from "@/components/ui/skeletons"

export const metadata = { title: "Notices | EduManage" }

async function NoticesContent() {
  // Session is guaranteed by admin layout — just read it for userId
  const session = await getServerSession(authOptions)

  const [notices, classes] = await Promise.all([
    db.notice.findMany({
      include: { createdBy: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.class.findMany({
      include: { course: true },
      orderBy: [{ course: { name: "asc" } }, { year: "asc" }],
    }),
  ])

  return (
    <NoticesClient
      notices={notices.map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        targetType: n.targetType,
        targetId: n.targetId,
        createdAt: n.createdAt.toISOString(),
        createdByName: `${n.createdBy.firstName} ${n.createdBy.lastName}`,
      }))}
      classes={classes.map((c) => ({
        id: c.id,
        label: `${c.course.name} - Year ${c.year} ${c.section}`,
      }))}
      canCreate={true}
      userId={session!.user.id}
      userRole="ADMIN"
    />
  )
}

export default function AdminNoticesPage() {
  return (
    <Suspense fallback={<NoticesSkeleton count={5} />}>
      <NoticesContent />
    </Suspense>
  )
}
