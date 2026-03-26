import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { name, code, credits, classId, teacherId } = body

  try {
    await db.subject.update({ where: { id }, data: { name, code, credits, classId } })

    if (teacherId) {
      await db.teacherAssignment.upsert({
        where: { teacherId_classId_subjectId: { teacherId, classId, subjectId: id } },
        update: {},
        create: { teacherId, classId, subjectId: id, isClassTeacher: false },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Subjects PATCH]", error)
    return NextResponse.json({ error: "Failed to update subject" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    await db.subject.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Subjects DELETE]", error)
    return NextResponse.json({ error: "Failed to delete subject" }, { status: 500 })
  }
}
