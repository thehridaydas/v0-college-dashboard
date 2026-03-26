import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await params
    const body = await req.json()

    const fee = await db.fee.findUnique({ where: { id } })
    if (!fee) return NextResponse.json({ error: "Fee not found" }, { status: 404 })

    // Student submitting UTR
    if (session.user.role === "STUDENT" && body.action === "submit_utr") {
      const student = await db.student.findUnique({ where: { userId: session.user.id } })
      if (!student || fee.studentId !== student.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      const updated = await db.fee.update({
        where: { id },
        data: { utr: body.utr, status: "SUBMITTED", submittedAt: new Date() },
      })
      return NextResponse.json({ fee: updated })
    }

    // Teacher verifying fee
    if (session.user.role === "TEACHER" && body.action === "verify") {
      const teacher = await db.teacher.findUnique({ where: { userId: session.user.id } })
      if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
      const updated = await db.fee.update({
        where: { id },
        data: { status: "VERIFIED", verifiedByTeacherId: teacher.id, verifiedAt: new Date() },
      })
      return NextResponse.json({ fee: updated })
    }

    // Teacher rejecting fee
    if (session.user.role === "TEACHER" && body.action === "reject") {
      const updated = await db.fee.update({
        where: { id },
        data: { status: "REJECTED", utr: null },
      })
      return NextResponse.json({ fee: updated })
    }

    // Admin updates
    if (session.user.role === "ADMIN") {
      const updated = await db.fee.update({
        where: { id },
        data: {
          amount: body.amount,
          dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
          status: body.status,
          description: body.description,
        },
      })
      return NextResponse.json({ fee: updated })
    }

    return NextResponse.json({ error: "Unauthorized action" }, { status: 403 })
  } catch (error) {
    console.error("[FEE PATCH]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
