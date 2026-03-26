import { db } from "@/lib/db"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AdminSubjectsClient } from "@/components/admin/subjects/admin-subjects-client"

export default async function AdminSubjectsPage() {
  const [subjects, classes, teachers] = await Promise.all([
    db.subject.findMany({
      include: {
        class: { include: { course: true } },
        assignments: {
          include: { teacher: { include: { user: { select: { firstName: true, lastName: true } } } } },
          take: 1,
        },
        _count: { select: { marks: true } },
      },
      orderBy: [{ class: { course: { name: "asc" } } }, { name: "asc" }],
    }),
    db.class.findMany({
      include: { course: true },
      orderBy: [{ course: { name: "asc" } }, { year: "asc" }],
    }),
    db.teacher.findMany({
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { user: { firstName: "asc" } },
    }),
  ])

  return (
    <DashboardShell pageTitle="Subjects">
      <AdminSubjectsClient
        subjects={subjects.map((s) => ({
          id: s.id,
          name: s.name,
          code: s.code,
          credits: s.credits,
          classId: s.classId,
          className: `${s.class.course.name} - Year ${s.class.year} ${s.class.section}`,
          teacher: s.assignments[0]
            ? `${s.assignments[0].teacher.user.firstName} ${s.assignments[0].teacher.user.lastName}`
            : null,
          marksCount: s._count.marks,
        }))}
        classes={classes.map((c) => ({
          id: c.id,
          label: `${c.course.name} - Year ${c.year} ${c.section}`,
        }))}
        teachers={teachers.map((t) => ({
          id: t.id,
          name: `${t.user.firstName} ${t.user.lastName}`,
        }))}
      />
    </DashboardShell>
  )
}
