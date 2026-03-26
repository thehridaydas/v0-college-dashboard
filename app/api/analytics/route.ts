import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "PRINCIPAL"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalCourses,
      pendingFees,
      verifiedFees,
      totalFeeAmount,
      recentStudents,
      attendanceStats,
      feesByStatus,
    ] = await Promise.all([
      db.student.count(),
      db.teacher.count(),
      db.class.count(),
      db.course.count(),
      db.fee.count({ where: { status: "PENDING" } }),
      db.fee.count({ where: { status: "VERIFIED" } }),
      db.fee.aggregate({ where: { status: "VERIFIED" }, _sum: { amount: true } }),
      db.user.findMany({
        where: { role: "STUDENT" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { firstName: true, lastName: true, email: true, createdAt: true },
      }),
      db.classAttendance.groupBy({
        by: ["status"],
        _count: { status: true },
        where: { date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),
      db.fee.groupBy({
        by: ["status"],
        _count: { status: true },
        _sum: { amount: true },
      }),
    ])

    const totalAttendance = attendanceStats.reduce((acc, s) => acc + s._count.status, 0)
    const presentCount = attendanceStats.find((s) => s.status === "PRESENT")?._count.status ?? 0
    const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0

    // Monthly enrollment data (last 6 months)
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const start = new Date(date.getFullYear(), date.getMonth(), 1)
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      const count = await db.user.count({
        where: { role: "STUDENT", createdAt: { gte: start, lte: end } },
      })
      monthlyData.push({
        month: start.toLocaleString("default", { month: "short" }),
        students: count,
      })
    }

    // Marks distribution
    const marksData = await db.mark.groupBy({
      by: ["examType"],
      _avg: { marks: true },
      _count: { marks: true },
    })

    return NextResponse.json({
      totalStudents,
      totalTeachers,
      totalClasses,
      totalCourses,
      pendingFees,
      verifiedFees,
      totalFeeAmount: totalFeeAmount._sum.amount ?? 0,
      attendanceRate,
      recentStudents,
      attendanceStats,
      feesByStatus,
      monthlyData,
      marksData,
    })
  } catch (error) {
    console.error("[ANALYTICS GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
