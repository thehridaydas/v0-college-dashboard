import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { courseId, year, section, classTeacherId } = body

  try {
    await db.class.update({
      where: { id },
      data: { courseId, year, section },
    })

    // Handle class teacher assignment
    if (classTeacherId) {
      await db.teacherAssignment.upsert({
        where: {
          teacherId_classId_subjectId: {
            teacherId: classTeacherId,
            classId: id,
            subjectId: null as unknown as string,
          },
        },
        update: { isClassTeacher: true },
        create: {
          teacherId: classTeacherId,
          classId: id,
          isClassTeacher: true,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Classes PATCH]", error)
    return NextResponse.json({ error: "Failed to update class" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    await db.class.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Classes DELETE]", error)
    return NextResponse.json({ error: "Failed to delete class" }, { status: 500 })
  }
}
