import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { AdminAnalyticsClient } from "@/components/admin/analytics/admin-analytics-client"

export const metadata = { title: "Analytics | EduManage" }

export default async function PrincipalAnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "PRINCIPAL") redirect("/login")

  const [feeStats, attendanceStats, marksStats, enrollmentStats] = await Promise.all([
    db.fee.groupBy({ by: ["status"], _count: { status: true }, _sum: { amount: true } }),
    db.classAttendance.groupBy({ by: ["status"], _count: { status: true } }),
    db.mark.aggregate({ _avg: { marks: true }, _count: { id: true } }),
    db.enrollment.groupBy({ by: ["classId"], _count: { classId: true }, orderBy: { _count: { classId: "desc" } }, take: 5 }),
  ])

  return (
    <AdminAnalyticsClient
      feeStats={feeStats.map((f) => ({ status: f.status, count: f._count.status, total: f._sum.amount ?? 0 }))}
      attendanceStats={attendanceStats.map((a) => ({ status: a.status, count: a._count.status }))}
      avgMarks={Math.round(marksStats._avg.marks ?? 0)}
      totalMarksEntered={marksStats._count.id}
      enrollmentStats={enrollmentStats.map((e) => ({ classId: e.classId, count: e._count.classId }))}
    />
  )
}
