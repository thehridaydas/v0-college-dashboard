import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { TeacherOverview } from "@/components/teacher/teacher-overview"

export default async function TeacherDashboardPage() {
  const session = await getServerSession(authOptions)

  const teacher = await db.teacher.findUnique({
    where: { userId: session!.user.id },
    include: {
      assignments: {
        include: {
          class: { include: { course: true, _count: { select: { enrollments: true } } } },
          subject: true,
        },
      },
    },
  })

  if (!teacher) {
    return (
      <DashboardShell pageTitle="Dashboard">
        <p className="text-muted-foreground">Teacher profile not found. Please contact admin.</p>
      </DashboardShell>
    )
  }

  const myClassIds = teacher.assignments.map((a) => a.classId)

  // Serialize queries to avoid connection pool exhaustion
  const pendingFees = await db.fee.count({
    where: {
      status: "SUBMITTED",
      student: { enrollments: { some: { classId: { in: myClassIds } } } },
    },
  })

  const recentMarks = await db.mark.findMany({
    where: { teacherId: teacher.id },
    include: {
      student: { include: { user: { select: { firstName: true, lastName: true } } } },
      subject: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  const attendanceSummary = await db.classAttendance.groupBy({
    by: ["status"],
    _count: { status: true },
    where: {
      classId: { in: myClassIds },
      date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
  })

  const notices = await db.notice.findMany({
    where: { OR: [{ targetType: "ALL" }, { targetType: "ROLE", targetId: "TEACHER" }] },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { id: true, title: true, createdAt: true },
  })

  const totalStudents = new Set(
    teacher.assignments.flatMap((a) => Array(a.class._count.enrollments).fill(a.classId))
  ).size

  const uniqueClasses = new Set(teacher.assignments.map((a) => a.classId)).size

  return (
    <DashboardShell pageTitle="Dashboard">
      <TeacherOverview
        teacher={{
          name: `${session!.user.firstName} ${session!.user.lastName}`,
          employeeId: teacher.employeeId,
          department: teacher.department,
        }}
        stats={{
          myClasses: uniqueClasses,
          mySubjects: teacher.assignments.filter((a) => a.subjectId).length,
          pendingFees,
          totalStudentsInClasses: teacher.assignments.reduce((a, t) => a + t.class._count.enrollments, 0),
        }}
        assignments={teacher.assignments.map((a) => ({
          classLabel: `${a.class.course.name} - Year ${a.class.year} ${a.class.section}`,
          subjectName: a.subject?.name ?? null,
          isClassTeacher: a.isClassTeacher,
          studentCount: a.class._count.enrollments,
        }))}
        recentMarks={recentMarks.map((m) => ({
          studentName: `${m.student.user.firstName} ${m.student.user.lastName}`,
          subjectName: m.subject.name,
          marks: m.marks,
          maxMarks: m.maxMarks,
          examType: m.examType,
          createdAt: m.createdAt,
        }))}
        attendanceSummary={attendanceSummary}
        recentNotices={notices}
      />
    </DashboardShell>
  )
}
