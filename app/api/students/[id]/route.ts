import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await params

    const student = await db.student.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, createdAt: true } },
        enrollments: { include: { class: { include: { course: true, subjects: true } } } },
        marks: { include: { subject: true } },
        fees: true,
        classAttendance: { orderBy: { date: "desc" }, take: 30 },
      },
    })

    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 })
    return NextResponse.json({ student })
  } catch (error) {
    console.error("[STUDENT GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params
    const body = await req.json()

    const student = await db.student.update({
      where: { id },
      data: {
        phone: body.phone,
        address: body.address,
        parentName: body.parentName,
        parentPhone: body.parentPhone,
        user: {
          update: {
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email?.toLowerCase(),
          },
        },
      },
      include: { user: true },
    })

    return NextResponse.json({ student })
  } catch (error) {
    console.error("[STUDENT PATCH]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params
    const student = await db.student.findUnique({ where: { id } })
    if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await db.user.delete({ where: { id: student.userId } })
    return NextResponse.json({ message: "Deleted successfully" })
  } catch (error) {
    console.error("[STUDENT DELETE]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
