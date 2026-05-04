import { db } from "@/lib/db"
import { AdminFeesClient } from "@/components/admin/fees/admin-fees-client"

export default async function AdminFeesPage() {
  const [fees, students] = await Promise.all([
    db.fee.findMany({
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        verifiedBy: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.student.findMany({
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { user: { firstName: "asc" } },
    }),
  ])

  const summary = {
    total: fees.reduce((a, f) => a + f.amount, 0),
    verified: fees.filter((f) => f.status === "VERIFIED").reduce((a, f) => a + f.amount, 0),
    pending: fees.filter((f) => f.status === "PENDING").length,
    submitted: fees.filter((f) => f.status === "SUBMITTED").length,
  }

  return (
    <AdminFeesClient
        fees={fees.map((f) => ({
          id: f.id,
          amount: f.amount,
          dueDate: f.dueDate,
          status: f.status,
          utr: f.utr,
          description: f.description,
          isExtraFee: f.isExtraFee,
          submittedAt: f.submittedAt,
          verifiedAt: f.verifiedAt,
          createdAt: f.createdAt,
          studentId: f.studentId,
          studentName: `${f.student.user.firstName} ${f.student.user.lastName}`,
          studentEmail: f.student.user.email,
          rollNumber: f.student.rollNumber,
          verifiedByName: f.verifiedBy
            ? `${f.verifiedBy.user.firstName} ${f.verifiedBy.user.lastName}`
            : null,
        }))}
        students={students.map((s) => ({
          id: s.id,
          name: `${s.user.firstName} ${s.user.lastName}`,
          rollNumber: s.rollNumber,
        }))}
        summary={summary}
      />
  )
}
