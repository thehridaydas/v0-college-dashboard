import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AdminOverview } from "@/components/admin/admin-overview"

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  try {
    // Serialize queries to avoid connection pool exhaustion with pooler
    const totalStudents = await db.student.count()
    const totalTeachers = await db.teacher.count()
    const totalClasses = await db.class.count()
    const pendingFees = await db.fee.count({ where: { status: "PENDING" } })
    
    const recentActivity = await db.user.findMany({
      where: { role: { in: ["STUDENT", "TEACHER"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { firstName: true, lastName: true, role: true, email: true, createdAt: true },
    })

    const attendanceStats = await db.classAttendance.groupBy({
      by: ["status"],
      _count: { status: true },
      where: { date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    })

    const feesByStatus = await db.fee.groupBy({ 
      by: ["status"], 
      _count: { status: true }, 
      _sum: { amount: true } 
    })

    // Monthly data
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const start = new Date(d.getFullYear(), d.getMonth(), 1)
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
      const count = await db.user.count({ 
        where: { 
          role: "STUDENT", 
          createdAt: { gte: start, lte: end } 
        } 
      })
      monthlyData.push({ 
        month: start.toLocaleString("default", { month: "short" }), 
        students: count 
      })
    }

    const notices = await db.noticeRecipient.count({ 
      where: { userId: session!.user.id, isRead: false } 
    })

    const totalPresent = attendanceStats.find((s) => s.status === "PRESENT")?._count.status ?? 0
    const totalAttendance = attendanceStats.reduce((a, s) => a + s._count.status, 0)
    const attendanceRate = totalAttendance > 0 ? Math.round((totalPresent / totalAttendance) * 100) : 0
    const totalFeeCollected = feesByStatus.find((f) => f.status === "VERIFIED")?._sum.amount ?? 0

    return (
      <DashboardShell
        pageTitle="Dashboard"
        notifications={[
          { id: "1", title: "New student registered", description: "A new student has registered", time: "2m ago", read: false },
          { id: "2", title: `${pendingFees} fees pending verification`, description: "Fees awaiting review", time: "1h ago", read: false },
          { id: "3", title: "Notice board updated", description: "New notice posted", time: "3h ago", read: true },
        ]}
      >
        <AdminOverview
          stats={{ totalStudents, totalTeachers, totalClasses, pendingFees, attendanceRate, totalFeeCollected, unreadNotices: notices }}
          recentActivity={recentActivity}
          monthlyData={monthlyData}
          feesByStatus={feesByStatus}
          attendanceStats={attendanceStats}
        />
      </DashboardShell>
    )
  } catch (error) {
    console.error("[v0] Admin dashboard error:", error)
    throw error
  }
}
