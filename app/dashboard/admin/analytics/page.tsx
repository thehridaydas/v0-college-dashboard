import { db } from "@/lib/db"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AdminAnalyticsClient } from "@/components/admin/analytics/admin-analytics-client"

export default async function AdminAnalyticsPage() {
  const [
    enrollmentByYear,
    feesByStatus,
    attendanceByMonth,
    topClasses,
    marksByExamType,
  ] = await Promise.all([
    // Enrollment by admission year
    db.student.groupBy({
      by: ["admissionYear"],
      _count: { admissionYear: true },
      orderBy: { admissionYear: "asc" },
    }),

    // Fees breakdown
    db.fee.groupBy({
      by: ["status"],
      _count: { status: true },
      _sum: { amount: true },
    }),

    // Attendance for last 6 months
    (async () => {
      const data = []
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
        data.push({
          month: start.toLocaleString("default", { month: "short" }),
          present, absent, late,
          total: present + absent + late,
        })
      }
      return data
    })(),

    // Top classes by student count
    db.class.findMany({
      include: {
        course: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { enrollments: { _count: "desc" } },
      take: 5,
    }),

    // Marks by exam type
    db.mark.groupBy({
      by: ["examType"],
      _avg: { marks: true },
      _count: { examType: true },
    }),
  ])

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
          label: `${c.course.name} Y${c.year}${c.section}`,
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
