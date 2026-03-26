import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { NoticesClient } from "@/components/shared/notices-client"

export default async function AdminNoticesPage() {
  const session = await getServerSession(authOptions)

  const [notices, classes] = await Promise.all([
    db.notice.findMany({
      include: {
        createdBy: { select: { firstName: true, lastName: true, role: true } },
        _count: { select: { recipients: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.class.findMany({
      include: { course: true },
      orderBy: [{ course: { name: "asc" } }, { year: "asc" }],
    }),
  ])

  return (
    <DashboardShell pageTitle="Notices">
      <NoticesClient
        notices={notices.map((n) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          targetType: n.targetType,
          targetId: n.targetId,
          createdAt: n.createdAt,
          createdByName: `${n.createdBy.firstName} ${n.createdBy.lastName}`,
          createdByRole: n.createdBy.role,
          recipientCount: n._count.recipients,
        }))}
        classes={classes.map((c) => ({ id: c.id, label: `${c.course.name} - Year ${c.year} ${c.section}` }))}
        canCreate={true}
        currentUserId={session!.user.id}
      />
    </DashboardShell>
  )
}
