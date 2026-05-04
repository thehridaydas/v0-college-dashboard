import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { StudentFeesClient } from "@/components/student/fees/student-fees-client"

export const metadata = { title: "My Fees | EduManage" }

export default async function StudentFeesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "STUDENT") redirect("/login")

  const student = await db.student.findUnique({ where: { userId: session.user.id } })
  if (!student) redirect("/login")

  const fees = await db.fee.findMany({
    where: { studentId: student.id },
    include: {
      verifiedBy: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <StudentFeesClient
        fees={fees.map((f) => ({
          id: f.id,
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
        studentId={student.id}
      />
  )
}
