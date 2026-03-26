import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { StudentProfileClient } from "@/components/student/profile/student-profile-client"

export const metadata = { title: "My Profile | EduManage" }

export default async function StudentProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "STUDENT") redirect("/login")

  const student = await db.student.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      enrollments: {
        include: {
          class: {
            include: {
              course: true,
              assignments: {
                where: { isClassTeacher: true },
                include: {
                  teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
                },
                take: 1,
              },
            },
          },
        },
        take: 1,
      },
    },
  })
  if (!student) redirect("/login")

  const enrollment = student.enrollments[0]
  const classTeacher = enrollment?.class.assignments[0]?.teacher

  return (
    <DashboardShell pageTitle="My Profile">
      <StudentProfileClient
        profile={{
          firstName: student.user.firstName,
          lastName: student.user.lastName,
          email: student.user.email,
          rollNumber: student.rollNumber,
          phone: student.phone,
          address: student.address,
          parentName: student.parentName,
          parentPhone: student.parentPhone,
          dateOfBirth: student.dateOfBirth?.toISOString() ?? null,
          admissionYear: student.admissionYear,
          classLabel: enrollment
            ? `${enrollment.class.course.name} — Year ${enrollment.class.year}, Section ${enrollment.class.section}`
            : "Not Enrolled",
          courseName: enrollment?.class.course.name ?? null,
          classTeacher: classTeacher
            ? `${classTeacher.user.firstName} ${classTeacher.user.lastName}`
            : null,
        }}
      />
    </DashboardShell>
  )
}
