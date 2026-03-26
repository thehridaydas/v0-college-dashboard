import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { TeacherAttendanceClient } from "@/components/teacher/attendance/teacher-attendance-client"

export default async function TeacherAttendancePage() {
  const session = await getServerSession(authOptions)

  const teacher = await db.teacher.findUnique({
    where: { userId: session!.user.id },
    include: {
      assignments: {
        include: {
          class: {
            include: {
              course: true,
              enrollments: {
                include: {
                  student: {
                    include: { user: { select: { firstName: true, lastName: true } } },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!teacher) {
    return (
      <DashboardShell pageTitle="Attendance">
        <p className="text-muted-foreground">Teacher profile not found.</p>
      </DashboardShell>
    )
  }

  // Get unique classes
  const classMap = new Map<string, { id: string; label: string; students: Array<{ id: string; name: string; rollNumber: string }> }>()
  for (const assignment of teacher.assignments) {
    if (!classMap.has(assignment.classId)) {
      classMap.set(assignment.classId, {
        id: assignment.classId,
        label: `${assignment.class.course.name} - Year ${assignment.class.year} ${assignment.class.section}`,
        students: assignment.class.enrollments.map((e) => ({
          id: e.student.id,
          name: `${e.student.user.firstName} ${e.student.user.lastName}`,
          rollNumber: e.student.rollNumber,
        })),
      })
    }
  }

  const classes = Array.from(classMap.values())

  // Recent attendance records
  const recentAttendance = await db.classAttendance.findMany({
    where: { classId: { in: classes.map((c) => c.id) } },
    include: {
      student: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return (
    <DashboardShell pageTitle="Attendance">
      <TeacherAttendanceClient
        classes={classes}
        recentAttendance={recentAttendance.map((a) => ({
          id: a.id,
          date: a.date,
          status: a.status,
          classId: a.classId,
          studentName: `${a.student.user.firstName} ${a.student.user.lastName}`,
          rollNumber: a.student.rollNumber,
        }))}
      />
    </DashboardShell>
  )
}
