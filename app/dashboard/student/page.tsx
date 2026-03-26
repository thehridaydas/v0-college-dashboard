import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { StudentOverview } from "@/components/student/student-overview"

export const metadata = { title: "Student Dashboard | EduManage" }

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "STUDENT") redirect("/login")

  const student = await db.student.findUnique({
    where: { userId: session.user.id },
    include: {
      enrollments: {
        include: { class: { include: { course: { select: { name: true } } } } },
        take: 1,
      },
    },
  })
  if (!student) redirect("/login")

  const enrollment = student.enrollments[0]
  const classId = enrollment?.classId
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Run all remaining queries in parallel - 1 round trip instead of 4
  const [attendanceStats, recentMarks, feesSummary, recentNotices] = await Promise.all([
    db.classAttendance.groupBy({
      by: ["status"],
      where: { studentId: student.id, date: { gte: thirtyDaysAgo } },
      _count: { status: true },
    }),
    db.mark.findMany({
      where: { studentId: student.id },
      include: { subject: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.fee.groupBy({
      by: ["status"],
      where: { studentId: student.id },
      _count: { status: true },
      _sum: { amount: true },
    }),
    db.notice.findMany({
      where: {
        OR: [
          { targetType: "ALL" },
          { targetType: "ROLE", targetId: "STUDENT" },
          ...(classId ? [{ targetType: "CLASS" as const, targetId: classId }] : []),
        ],
      },
      include: { createdBy: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ])

  const totalAttendance = attendanceStats.reduce((a, b) => a + b._count.status, 0)
  const presentCount = attendanceStats.find((a) => a.status === "PRESENT")?._count.status ?? 0
  const lateCount = attendanceStats.find((a) => a.status === "LATE")?._count.status ?? 0
  const attendancePct = totalAttendance > 0 ? Math.round(((presentCount + lateCount) / totalAttendance) * 100) : 0

  return (
    <DashboardShell pageTitle="Dashboard">
      <StudentOverview
        student={{
          name: `${session.user.firstName} ${session.user.lastName}`,
          rollNumber: student.rollNumber,
          email: session.user.email ?? "",
          classLabel: enrollment
            ? `${enrollment.class.course.name} - Year ${enrollment.class.year}, Sec ${enrollment.class.section}`
            : "Not Enrolled",
        }}
        attendanceStats={{
          attendancePct,
          present: presentCount,
          late: lateCount,
          absent: attendanceStats.find((a) => a.status === "ABSENT")?._count.status ?? 0,
          total: totalAttendance,
        }}
        recentMarks={recentMarks.map((m) => ({
          subjectName: m.subject.name,
          marks: m.marks,
          maxMarks: m.maxMarks,
          examType: m.examType,
          createdAt: m.createdAt.toISOString(),
        }))}
        feesSummary={feesSummary.map((f) => ({
          status: f.status,
          count: f._count.status,
          total: f._sum.amount ?? 0,
        }))}
        recentNotices={recentNotices.map((n) => ({
          id: n.id,
          title: n.title,
          createdByName: `${n.createdBy.firstName} ${n.createdBy.lastName}`,
          createdAt: n.createdAt.toISOString(),
        }))}
      />
    </DashboardShell>
  )
}
