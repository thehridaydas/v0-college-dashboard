import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { TeacherFeesClient } from "@/components/teacher/fees/teacher-fees-client"

export const metadata = { title: "Fee Verification | EduManage" }

export default async function TeacherFeesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "TEACHER") redirect("/login")

  const teacher = await db.teacher.findUnique({ where: { userId: session.user.id } })
  if (!teacher) redirect("/login")

  const fees = await db.fee.findMany({
    where: { status: { in: ["PENDING", "SUBMITTED", "VERIFIED", "REJECTED"] } },
    include: {
      student: {
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          enrollments: {
            include: { class: { include: { course: true } } },
            take: 1,
          },
        },
      },
      verifiedBy: {
        include: { user: { select: { firstName: true, lastName: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const summary = {
    pending: fees.filter((f) => f.status === "PENDING").length,
    submitted: fees.filter((f) => f.status === "SUBMITTED").length,
    verified: fees.filter((f) => f.status === "VERIFIED").length,
    rejected: fees.filter((f) => f.status === "REJECTED").length,
    totalAmount: fees.filter((f) => f.status === "VERIFIED").reduce((a, b) => a + b.amount, 0),
  }

  return (
    <TeacherFeesClient
        fees={fees.map((f) => ({
          id: f.id,
          studentName: `${f.student.user.firstName} ${f.student.user.lastName}`,
          studentEmail: f.student.user.email,
          rollNumber: f.student.rollNumber,
          classLabel: f.student.enrollments[0]
            ? `${f.student.enrollments[0].class.course.code} - Y${f.student.enrollments[0].class.year}${f.student.enrollments[0].class.section}`
            : "N/A",
          amount: f.amount,
          dueDate: f.dueDate.toISOString(),
          status: f.status,
          utr: f.utr,
          description: f.description,
          isExtraFee: f.isExtraFee,
          submittedAt: f.submittedAt?.toISOString() ?? null,
          verifiedAt: f.verifiedAt?.toISOString() ?? null,
          verifiedByName: f.verifiedBy
            ? `${f.verifiedBy.user.firstName} ${f.verifiedBy.user.lastName}`
            : null,
          createdAt: f.createdAt.toISOString(),
        }))}
        summary={summary}
        teacherId={teacher.id}
      />
  )
}
