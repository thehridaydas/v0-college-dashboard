import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { StudentAttendanceClient } from "@/components/student/attendance/student-attendance-client"

export const metadata = { title: "Attendance | EduManage" }

export default async function StudentAttendancePage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "STUDENT") redirect("/login")

  const student = await db.student.findUnique({ where: { userId: session.user.id } })
  if (!student) redirect("/login")

  const [classAttendance, subjectAttendance] = await Promise.all([
    db.classAttendance.findMany({
      where: { studentId: student.id },
      include: { class: { include: { course: true } } },
      orderBy: { date: "desc" },
    }),
    db.subjectAttendance.findMany({
      where: { studentId: student.id },
      include: {
        subject: true,
        class: { include: { course: true } },
      },
      orderBy: { date: "desc" },
    }),
  ])

  const classData = classAttendance.map((a) => ({
    id: a.id,
    classLabel: `${a.class.course.code} Y${a.class.year}${a.class.section}`,
    date: a.date.toISOString(),
    status: a.status,
    remarks: a.remarks,
  }))

  const subjectData = subjectAttendance.map((a) => ({
    id: a.id,
    subjectName: a.subject.name,
    classLabel: `${a.class.course.code} Y${a.class.year}${a.class.section}`,
    date: a.date.toISOString(),
    status: a.status,
    remarks: a.remarks,
  }))

  return <StudentAttendanceClient classAttendance={classData} subjectAttendance={subjectData} />
}
