import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { createFeeSchema } from "@/lib/validations"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId") ?? undefined
    const status = searchParams.get("status") ?? undefined

    let where: any = {}

    // Students can only see their own fees
    if (session.user.role === "STUDENT") {
      const student = await db.student.findUnique({ where: { userId: session.user.id } })
      if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 })
      where.studentId = student.id
    } else if (studentId) {
      where.studentId = studentId
    }

    if (status) where.status = status

    const fees = await db.fee.findMany({
      where,
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        verifiedBy: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ fees })
  } catch (error) {
    console.error("[FEES GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = createFeeSchema.parse(body)

    const fee = await db.fee.create({
      data: {
        studentId: data.studentId,
        amount: data.amount,
        dueDate: new Date(data.dueDate),
        description: data.description,
        isExtraFee: data.isExtraFee,
        status: "PENDING",
      },
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    })

    return NextResponse.json({ fee }, { status: 201 })
  } catch (error: any) {
    console.error("[FEES POST]", error)
    return NextResponse.json({ error: error.message ?? "Internal server error" }, { status: 500 })
  }
}
