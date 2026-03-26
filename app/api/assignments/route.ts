import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { teacherId, classId, subjectId, isClassTeacher } = body

    const assignment = await db.teacherAssignment.upsert({
      where: {
        teacherId_classId_subjectId: {
          teacherId,
          classId,
          subjectId: subjectId ?? null,
        },
      },
      create: { teacherId, classId, subjectId: subjectId ?? null, isClassTeacher: isClassTeacher ?? false },
      update: { isClassTeacher: isClassTeacher ?? false },
      include: {
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
        class: { include: { course: true } },
        subject: true,
      },
    })

    return NextResponse.json({ assignment }, { status: 201 })
  } catch (error: any) {
    console.error("[ASSIGNMENTS POST]", error)
    return NextResponse.json({ error: error.message ?? "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    await db.teacherAssignment.delete({ where: { id } })
    return NextResponse.json({ message: "Assignment removed" })
  } catch (error) {
    console.error("[ASSIGNMENTS DELETE]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
