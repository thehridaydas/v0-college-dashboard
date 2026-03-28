import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { PrincipalOverview } from "@/components/principal/principal-overview"

export const metadata = { title: "Principal Dashboard | EduManage" }

export default async function PrincipalDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "PRINCIPAL") redirect("/login")

  // Serialize queries to avoid connection pool exhaustion
  const totalStudents = await db.student.count()
  const totalTeachers = await db.teacher.count()
  const totalCourses = await db.course.count()
  const totalClasses = await db.class.count()

  const feeStats = await db.fee.groupBy({
    by: ["status"],
    _count: { status: true },
    _sum: { amount: true },
  })

  const attendanceStats = await db.classAttendance.groupBy({
    by: ["status"],
    _count: { status: true },
  })

  const recentNotices = await db.notice.findMany({
    include: { createdBy: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  const topClasses = await db.class.findMany({
    include: { course: true, enrollments: true, subjects: true },
    orderBy: { createdAt: "asc" },
    take: 6,
  })

  const totalAttendance = attendanceStats.reduce((a, b) => a + b._count.status, 0)
  const presentCount = attendanceStats.find((a) => a.status === "PRESENT")?._count.status ?? 0
  const lateCount = attendanceStats.find((a) => a.status === "LATE")?._count.status ?? 0
  const attendancePct = totalAttendance > 0 ? Math.round(((presentCount + lateCount) / totalAttendance) * 100) : 0

  const verifiedFees = feeStats.find((f) => f.status === "VERIFIED")
  const pendingFees = feeStats.find((f) => f.status === "PENDING")

  return (
    <PrincipalOverview
        stats={{
          totalStudents,
          totalTeachers,
          totalCourses,
          totalClasses,
          attendancePct,
          collectedFees: verifiedFees?._sum.amount ?? 0,
          pendingFeesCount: pendingFees?._count.status ?? 0,
          pendingFeesAmount: pendingFees?._sum.amount ?? 0,
        }}
        recentNotices={recentNotices.map((n) => ({
          id: n.id,
          title: n.title,
          createdByName: `${n.createdBy.firstName} ${n.createdBy.lastName}`,
          createdAt: n.createdAt.toISOString(),
        }))}
        topClasses={topClasses.map((c) => ({
          label: `${c.course.code} Y${c.year}${c.section}`,
          courseName: c.course.name,
          studentCount: c.enrollments.length,
          subjectCount: c.subjects.length,
        }))}
        feeStats={feeStats.map((f) => ({
          status: f.status,
          count: f._count.status,
          total: f._sum.amount ?? 0,
        }))}
        principalName={`${session.user.firstName} ${session.user.lastName}`}
      />
  )
}
