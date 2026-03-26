import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { PrincipalReportsClient } from "@/components/principal/reports/principal-reports-client"

export const metadata = { title: "Reports | EduManage" }

export default async function PrincipalReportsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "PRINCIPAL") redirect("/login")

  const [students, teachers, classes] = await Promise.all([
    db.student.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        enrollments: {
          include: { class: { include: { course: true } } },
          take: 1,
        },
        fees: { select: { status: true, amount: true } },
        marks: { select: { marks: true, maxMarks: true } },
      },
      orderBy: { rollNumber: "asc" },
    }),
    db.teacher.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        assignments: { include: { class: { include: { course: true } }, subject: true } },
      },
    }),
    db.class.findMany({
      include: {
        course: true,
        enrollments: { select: { studentId: true } },
        subjects: { select: { id: true } },
      },
      orderBy: { year: "asc" },
    }),
  ])

  return (
    <DashboardShell pageTitle="Reports">
      <PrincipalReportsClient
        studentReport={students.map((s) => {
          const enrollment = s.enrollments[0]
          const verifiedFees = s.fees.filter((f) => f.status === "VERIFIED").reduce((a, b) => a + b.amount, 0)
          const pendingFees = s.fees.filter((f) => f.status === "PENDING").reduce((a, b) => a + b.amount, 0)
          const avgScore = s.marks.length > 0
            ? Math.round(s.marks.reduce((a, b) => a + (b.marks / b.maxMarks) * 100, 0) / s.marks.length)
            : null
          return {
            name: `${s.user.firstName} ${s.user.lastName}`,
            email: s.user.email,
            rollNumber: s.rollNumber,
            classLabel: enrollment
              ? `${enrollment.class.course.code} Y${enrollment.class.year}${enrollment.class.section}`
              : "—",
            avgScore,
            verifiedFees,
            pendingFees,
          }
        })}
        classReport={classes.map((c) => ({
          label: `${c.course.code} Y${c.year}${c.section}`,
          courseName: c.course.name,
          studentCount: c.enrollments.length,
          subjectCount: c.subjects.length,
        }))}
        teacherReport={teachers.map((t) => ({
          name: `${t.user.firstName} ${t.user.lastName}`,
          email: t.user.email,
          employeeId: t.employeeId,
          department: t.department,
          classCount: new Set(t.assignments.map((a) => a.classId)).size,
          subjectCount: t.assignments.filter((a) => a.subjectId).length,
        }))}
      />
    </DashboardShell>
  )
}
