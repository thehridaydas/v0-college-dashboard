import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { firstName, lastName, email, password, employeeId, department, phone, qualification } = body

  try {
    const teacher = await db.teacher.findUnique({ where: { id } })
    if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 })

    const userUpdate: Record<string, unknown> = { firstName, lastName, email: email.toLowerCase() }
    if (password) {
      userUpdate.password = await bcrypt.hash(password, 12)
    }

    await db.teacher.update({
      where: { id },
      data: {
        employeeId,
        department: department || null,
        phone: phone || null,
        qualification: qualification || null,
        user: { update: userUpdate },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Teachers PATCH]", error)
    return NextResponse.json({ error: "Failed to update teacher" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const teacher = await db.teacher.findUnique({ where: { id } })
    if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 })

    await db.user.delete({ where: { id: teacher.userId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Teachers DELETE]", error)
    return NextResponse.json({ error: "Failed to delete teacher" }, { status: 500 })
  }
}
