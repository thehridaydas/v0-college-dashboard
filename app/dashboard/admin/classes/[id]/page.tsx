import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { ClassDetailClient } from "@/components/admin/classes/class-detail-client"

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const cls = await db.class.findUnique({
    where: { id },
    include: {
      course: true,
      subjects: {
        orderBy: { name: "asc" },
        include: {
          assignments: {
            include: {
              teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
            },
          },
        },
      },
      enrollments: {
        include: {
          student: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true } },
            },
          },
        },
        orderBy: { enrolledAt: "asc" },
      },
      assignments: {
        include: {
          teacher: {
            include: { user: { select: { firstName: true, lastName: true, email: true } } },
          },
          subject: { select: { name: true } },
        },
      },
    },
  })

  if (!cls) notFound()

  // Compute attendance for each student (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const attendanceRecords = await db.classAttendance.findMany({
    where: { classId: id, date: { gte: thirtyDaysAgo } },
    select: { studentId: true, status: true },
  })

  // Group attendance by studentId
  const attendanceMap = new Map<string, { present: number; total: number }>()
  for (const record of attendanceRecords) {
    const existing = attendanceMap.get(record.studentId) ?? { present: 0, total: 0 }
    attendanceMap.set(record.studentId, {
      present: existing.present + (record.status === "PRESENT" ? 1 : 0),
      total: existing.total + 1,
    })
  }

  const classTeacher = cls.assignments.find((a) => a.isClassTeacher)
  const uniqueTeachers = Array.from(
    new Map(cls.assignments.map((a) => [a.teacherId, a])).values()
  )

  return (
    <DashboardShell pageTitle={`${cls.course.name} — Year ${cls.year} ${cls.section}`}>
      <ClassDetailClient
        cls={{
          id: cls.id,
          year: cls.year,
          section: cls.section,
          courseName: cls.course.name,
          courseCode: cls.course.code,
          classTeacher: classTeacher
            ? `${classTeacher.teacher.user.firstName} ${classTeacher.teacher.user.lastName}`
            : null,
          classTeacherId: classTeacher?.teacherId ?? null,
        }}
        stats={{
          studentCount: cls.enrollments.length,
          teacherCount: uniqueTeachers.length,
          subjectCount: cls.subjects.length,
        }}
        students={cls.enrollments.map((e) => {
          const att = attendanceMap.get(e.student.id)
          const attendancePct = att && att.total > 0
            ? Math.round((att.present / att.total) * 100)
            : null
          return {
            id: e.student.id,
            firstName: e.student.user.firstName,
            lastName: e.student.user.lastName,
            email: e.student.user.email,
            rollNumber: e.student.rollNumber,
            attendancePct,
            enrolledAt: e.enrolledAt.toISOString(),
          }
        })}
        teachers={uniqueTeachers.map((a) => ({
          id: a.teacher.id,
          firstName: a.teacher.user.firstName,
          lastName: a.teacher.user.lastName,
          email: a.teacher.user.email,
          isClassTeacher: a.isClassTeacher,
          subjects: cls.assignments
            .filter((x) => x.teacherId === a.teacherId && x.subject)
            .map((x) => x.subject!.name),
        }))}
        subjects={cls.subjects.map((s) => ({
          id: s.id,
          name: s.name,
          code: s.code,
          credits: s.credits,
          teacher: s.assignments[0]
            ? `${s.assignments[0].teacher.user.firstName} ${s.assignments[0].teacher.user.lastName}`
            : null,
        }))}
      />
    </DashboardShell>
  )
}
