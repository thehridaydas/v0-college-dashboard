import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { TeacherClassesClient } from "@/components/teacher/classes/teacher-classes-client"

export const metadata = { title: "My Classes | EduManage" }

export default async function TeacherClassesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "TEACHER") redirect("/login")

  // Single query - get teacher + assignments in one round trip
  const teacher = await db.teacher.findUnique({
    where: { userId: session.user.id },
    include: {
      assignments: {
        include: {
          class: {
            include: {
              course: { select: { name: true, code: true } },
              enrollments: {
                include: {
                  student: {
                    select: {
                      id: true,
                      rollNumber: true,
                      user: { select: { firstName: true, lastName: true, email: true } },
                    },
                  },
                },
              },
              subjects: { select: { name: true } },
            },
          },
          subject: { select: { name: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })
  if (!teacher) redirect("/login")

  const assignments = teacher.assignments

  const classMap = new Map<string, {
    classId: string
    classLabel: string
    courseName: string
    isClassTeacher: boolean
    subjects: string[]
    studentCount: number
    students: Array<{ id: string; name: string; rollNumber: string; email: string }>
  }>()

  for (const a of assignments) {
    const key = a.classId
    if (!classMap.has(key)) {
      classMap.set(key, {
        classId: key,
        classLabel: `${a.class.course.code} - Year ${a.class.year}, Sec ${a.class.section}`,
        courseName: a.class.course.name,
        isClassTeacher: a.isClassTeacher,
        subjects: [],
        studentCount: a.class.enrollments.length,
        students: a.class.enrollments.map((e) => ({
          id: e.student.id,
          name: `${e.student.user.firstName} ${e.student.user.lastName}`,
          rollNumber: e.student.rollNumber,
          email: e.student.user.email,
        })),
      })
    }
    const entry = classMap.get(key)!
    if (a.subject) entry.subjects.push(a.subject.name)
    if (a.isClassTeacher) entry.isClassTeacher = true
  }

  return <TeacherClassesClient classes={Array.from(classMap.values())} />
}
