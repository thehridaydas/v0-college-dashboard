import { Suspense } from "react"
import { db } from "@/lib/db"
import { AdminTeachersClient } from "@/components/admin/teachers/admin-teachers-client"
import { TablePageSkeleton } from "@/components/ui/skeletons"

export const metadata = { title: "Teachers | EduManage" }

async function TeachersContent() {
  const [teachers, classes] = await Promise.all([
    db.teacher.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true, createdAt: true } },
        assignments: {
          include: { class: { include: { course: true } }, subject: true },
          where: { isClassTeacher: true },
          take: 1,
        },
        _count: { select: { assignments: true } },
      },
      orderBy: { user: { createdAt: "desc" } },
    }),
    db.class.findMany({
      include: { course: true },
      orderBy: [{ course: { name: "asc" } }, { year: "asc" }],
    }),
  ])

  return (
    <AdminTeachersClient
      teachers={teachers.map((t) => ({
        id: t.id,
        userId: t.userId,
        employeeId: t.employeeId,
        department: t.department,
        phone: t.phone,
        qualification: t.qualification,
        firstName: t.user.firstName,
        lastName: t.user.lastName,
        email: t.user.email,
        createdAt: t.user.createdAt,
        classTeacherOf: t.assignments[0]
          ? `${t.assignments[0].class.course.name} - Year ${t.assignments[0].class.year} ${t.assignments[0].class.section}`
          : null,
        totalAssignments: t._count.assignments,
      }))}
      classes={classes.map((c) => ({
        id: c.id,
        label: `${c.course.name} - Year ${c.year} ${c.section}`,
      }))}
    />
  )
}

export default function AdminTeachersPage() {
  return (
    <Suspense fallback={<TablePageSkeleton statCount={3} cols={5} rows={10} />}>
      <TeachersContent />
    </Suspense>
  )
}
