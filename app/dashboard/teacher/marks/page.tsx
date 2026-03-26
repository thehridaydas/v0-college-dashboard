import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { TeacherMarksClient } from "@/components/teacher/marks/teacher-marks-client"

export default async function TeacherMarksPage() {
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
          subject: true,
        },
        where: { subjectId: { not: null } },
      },
    },
  })

  if (!teacher) {
    return (
      <DashboardShell pageTitle="Marks">
        <p className="text-muted-foreground">Teacher profile not found.</p>
      </DashboardShell>
    )
  }

  const existingMarks = await db.mark.findMany({
    where: { teacherId: teacher.id },
    include: {
      student: { include: { user: { select: { firstName: true, lastName: true } } } },
      subject: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <DashboardShell pageTitle="Marks">
      <TeacherMarksClient
        teacherId={teacher.id}
        subjects={teacher.assignments.map((a) => ({
          subjectId: a.subjectId!,
          subjectName: a.subject!.name,
          subjectCode: a.subject!.code,
          classId: a.classId,
          classLabel: `${a.class.course.name} - Year ${a.class.year} ${a.class.section}`,
          students: a.class.enrollments.map((e) => ({
            id: e.student.id,
            name: `${e.student.user.firstName} ${e.student.user.lastName}`,
            rollNumber: e.student.rollNumber,
          })),
        }))}
        existingMarks={existingMarks.map((m) => ({
          id: m.id,
          studentId: m.studentId,
          subjectId: m.subjectId,
          studentName: `${m.student.user.firstName} ${m.student.user.lastName}`,
          subjectName: m.subject.name,
          marks: m.marks,
          maxMarks: m.maxMarks,
          examType: m.examType,
          createdAt: m.createdAt,
        }))}
      />
    </DashboardShell>
  )
}
