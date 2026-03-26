import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { StudentGradesClient } from "@/components/student/grades/student-grades-client"

export const metadata = { title: "Grades | EduManage" }

export default async function StudentGradesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "STUDENT") redirect("/login")

  const student = await db.student.findUnique({ where: { userId: session.user.id } })
  if (!student) redirect("/login")

  const marks = await db.mark.findMany({
    where: { studentId: student.id },
    include: {
      subject: { include: { class: { include: { course: true } } } },
      teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <DashboardShell pageTitle="Grades">
      <StudentGradesClient
        marks={marks.map((m) => ({
          id: m.id,
          subjectName: m.subject.name,
          subjectCode: m.subject.code,
          classLabel: `${m.subject.class.course.code} Y${m.subject.class.year}${m.subject.class.section}`,
          teacherName: `${m.teacher.user.firstName} ${m.teacher.user.lastName}`,
          marks: m.marks,
          maxMarks: m.maxMarks,
          examType: m.examType,
          examDate: m.examDate?.toISOString() ?? null,
          remarks: m.remarks,
          createdAt: m.createdAt.toISOString(),
        }))}
        studentName={`${session.user.firstName} ${session.user.lastName}`}
      />
    </DashboardShell>
  )
}
