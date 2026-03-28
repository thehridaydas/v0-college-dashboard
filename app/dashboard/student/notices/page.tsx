import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { NoticesClient } from "@/components/shared/notices-client"

export const metadata = { title: "Notices | EduManage" }

export default async function StudentNoticesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "STUDENT") redirect("/login")

  const student = await db.student.findUnique({
    where: { userId: session.user.id },
    include: { enrollments: { select: { classId: true }, take: 1 } },
  })
  if (!student) redirect("/login")

  const classId = student.enrollments[0]?.classId

  const notices = await db.notice.findMany({
    where: {
      OR: [
        { targetType: "ALL" },
        { targetType: "ROLE", targetId: "STUDENT" },
        ...(classId ? [{ targetType: "CLASS" as const, targetId: classId }] : []),
      ],
    },
    include: { createdBy: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
  })

  const serialized = notices.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    targetType: n.targetType,
    targetId: n.targetId,
    createdByName: `${n.createdBy.firstName} ${n.createdBy.lastName}`,
    createdAt: n.createdAt.toISOString(),
  }))

  return (
    <NoticesClient
        notices={serialized}
        canCreate={false}
        userId={session.user.id}
        userRole="STUDENT"
      />
  )
}
