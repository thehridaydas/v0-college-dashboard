import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AdminStudentsClient } from "@/components/admin/students/admin-students-client"

export default async function AdminStudentsPage() {
  const session = await getServerSession(authOptions)

  const [students, classes] = await Promise.all([
    db.student.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true, createdAt: true } },
        // Only fetch first enrollment and limit fee count instead of full records
        enrollments: {
          include: { class: { include: { course: { select: { name: true } } } } },
          take: 1,
        },
        _count: { select: { fees: { where: { status: "PENDING" } } } },
      },
      orderBy: { user: { createdAt: "desc" } },
    }),
    db.class.findMany({
      include: { course: { select: { name: true } } },
      orderBy: [{ year: "asc" }],
    }),
  ])

  return (
    <DashboardShell pageTitle="Students">
      <AdminStudentsClient
        students={students.map((s) => ({
          id: s.id,
          userId: s.userId,
          rollNumber: s.rollNumber,
          phone: s.phone,
          parentName: s.parentName,
          admissionYear: s.admissionYear,
          firstName: s.user.firstName,
          lastName: s.user.lastName,
          email: s.user.email,
          createdAt: s.user.createdAt,
          enrolledClass: s.enrollments[0]
            ? `${s.enrollments[0].class.course.name} - Year ${s.enrollments[0].class.year} ${s.enrollments[0].class.section}`
            : null,
          classId: s.enrollments[0]?.classId ?? null,
          pendingFees: s._count.fees,
        }))}
        classes={classes.map((c) => ({
          id: c.id,
          label: `${c.course.name} - Year ${c.year} ${c.section}`,
        }))}
      />
    </DashboardShell>
  )
}
