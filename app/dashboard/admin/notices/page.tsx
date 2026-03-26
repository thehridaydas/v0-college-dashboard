import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { NoticesClient } from "@/components/shared/notices-client"

export const metadata = { title: "Notices | EduManage" }

export default async function AdminNoticesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") redirect("/login")

  const [notices, classes] = await Promise.all([
    db.notice.findMany({
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
      },
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
      userId={session.user.id}
      userRole="ADMIN"
    />
  )
}
