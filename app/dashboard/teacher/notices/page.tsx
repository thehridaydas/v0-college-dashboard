import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { NoticesClient } from "@/components/shared/notices-client"

export const metadata = { title: "Notices | EduManage" }

export default async function TeacherNoticesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "TEACHER") redirect("/login")

  const notices = await db.notice.findMany({
    where: {
      OR: [
        { targetType: "ALL" },
        { targetType: "ROLE", targetId: "TEACHER" },
      ],
    },
    include: { createdBy: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <NoticesClient
        notices={notices.map((n) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          targetType: n.targetType,
          targetId: n.targetId,
          createdByName: `${n.createdBy.firstName} ${n.createdBy.lastName}`,
          createdAt: n.createdAt.toISOString(),
        }))}
        canCreate={false}
        userId={session.user.id}
        userRole="TEACHER"
      />
  )
}
