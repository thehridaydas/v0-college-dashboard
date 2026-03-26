import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AdminAnalyticsClient } from "@/components/admin/analytics/admin-analytics-client"

export const metadata = { title: "Analytics | EduManage" }

export default async function PrincipalAnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "PRINCIPAL") redirect("/login")

  const [enrollmentByYear, feesByStatus, topClasses, marksByExamType] = await Promise.all([
    db.student.groupBy({
      by: ["admissionYear"],
      _count: { admissionYear: true },
      orderBy: { admissionYear: "asc" },
    }),
    db.fee.groupBy({ by: ["status"], _count: { status: true }, _sum: { amount: true } }),
    db.class.findMany({
      include: { course: true, _count: { select: { enrollments: true } } },
      orderBy: { enrollments: { _count: "desc" } },
      take: 5,
    }),
    db.mark.groupBy({
      by: ["examType"],
      _avg: { marks: true },
      _count: { examType: true },
    }),
  ])

  // Build 6-month attendance data
  const attendanceByMonth = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    const [present, absent, late] = await Promise.all([
      db.classAttendance.count({ where: { status: "PRESENT", date: { gte: start, lte: end } } }),
      db.classAttendance.count({ where: { status: "ABSENT", date: { gte: start, lte: end } } }),
      db.classAttendance.count({ where: { status: "LATE", date: { gte: start, lte: end } } }),
    ])
    attendanceByMonth.push({
      month: start.toLocaleString("default", { month: "short" }),
      present,
      absent,
      late,
      total: present + absent + late,
    })
  }

  return (
    <DashboardShell pageTitle="Analytics">
      <AdminAnalyticsClient
        enrollmentByYear={enrollmentByYear.map((e) => ({
          year: e.admissionYear.toString(),
          students: e._count.admissionYear,
        }))}
        feesByStatus={feesByStatus.map((f) => ({
          status: f.status,
          count: f._count.status,
          amount: f._sum.amount ?? 0,
        }))}
        attendanceByMonth={attendanceByMonth}
        topClasses={topClasses.map((c) => ({
          label: `${c.course.code} Y${c.year}${c.section}`,
          students: c._count.enrollments,
        }))}
        marksByExamType={marksByExamType.map((m) => ({
          examType: m.examType,
          avgMarks: Math.round((m._avg.marks ?? 0) * 10) / 10,
          count: m._count.examType,
        }))}
      />
    </DashboardShell>
  )
}
