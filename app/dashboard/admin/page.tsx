import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { AdminOverview } from "@/components/admin/admin-overview"
import { DashboardOverviewSkeleton } from "@/components/ui/skeletons"

export const metadata = { title: "Dashboard | EduManage" }

async function AdminDashboardContent() {
  const session = await getServerSession(authOptions)

  const [counts, feesByStatus, attendanceStats] = await Promise.all([
    db.$transaction([
      db.student.count(),
      db.teacher.count(),
      db.class.count(),
      db.fee.count({ where: { status: "PENDING" } }),
      db.noticeRecipient.count({ where: { userId: session!.user.id, isRead: false } }),
    ]),
    db.fee.groupBy({
      by: ["status"],
      _count: { status: true },
      _sum: { amount: true },
    }),
    db.classAttendance.groupBy({
      by: ["status"],
      _count: { status: true },
      where: { date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    }),
  ])

  const [totalStudents, totalTeachers, totalClasses, pendingFees, notices] = counts

  const [recentActivity, allStudents] = await Promise.all([
    db.user.findMany({
      where: { role: { in: ["STUDENT", "TEACHER"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { firstName: true, lastName: true, role: true, email: true, createdAt: true },
    }),
    db.user.findMany({
      where: {
        role: "STUDENT",
        createdAt: { gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) },
      },
      select: { createdAt: true },
    }),
  ])

  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    const count = allStudents.filter((s) => s.createdAt >= start && s.createdAt <= end).length
    monthlyData.push({ month: start.toLocaleString("default", { month: "short" }), students: count })
  }

  const totalPresent = attendanceStats.find((s) => s.status === "PRESENT")?._count.status ?? 0
  const totalAttendance = attendanceStats.reduce((a, s) => a + s._count.status, 0)
  const attendanceRate = totalAttendance > 0 ? Math.round((totalPresent / totalAttendance) * 100) : 0
  const totalFeeCollected = feesByStatus.find((f) => f.status === "VERIFIED")?._sum.amount ?? 0

  return (
    <AdminOverview
      stats={{ totalStudents, totalTeachers, totalClasses, pendingFees, attendanceRate, totalFeeCollected, unreadNotices: notices }}
      recentActivity={recentActivity}
      monthlyData={monthlyData}
      feesByStatus={feesByStatus}
      attendanceStats={attendanceStats}
    />
  )
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardOverviewSkeleton />}>
      <AdminDashboardContent />
    </Suspense>
  )
}
