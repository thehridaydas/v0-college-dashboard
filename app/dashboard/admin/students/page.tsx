import { Suspense } from "react"
import { db } from "@/lib/db"
import { AdminStudentsClient } from "@/components/admin/students/admin-students-client"
import { TablePageSkeleton } from "@/components/ui/skeletons"

export const metadata = { title: "Students | EduManage" }

async function StudentsContent() {
  const [students, classes] = await Promise.all([
    db.student.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true, createdAt: true } },
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
  )
}

export default function AdminStudentsPage() {
  return (
    <Suspense fallback={<TablePageSkeleton statCount={3} cols={5} rows={10} />}>
      <StudentsContent />
    </Suspense>
  )
}
