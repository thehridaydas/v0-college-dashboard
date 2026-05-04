import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { createMarkSchema } from "@/lib/validations"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId") ?? undefined
    const subjectId = searchParams.get("subjectId") ?? undefined
    const classId = searchParams.get("classId") ?? undefined

    const where: any = {}
    if (studentId) where.studentId = studentId
    if (subjectId) where.subjectId = subjectId
    if (classId) where.subject = { classId }

    const marks = await db.mark.findMany({
      where,
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
        subject: { include: { class: { include: { course: true } } } },
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ marks })
  } catch (error) {
    console.error("[MARKS GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = createMarkSchema.parse(body)

    // Derive teacherId securely based on role.
    // TEACHER: always use the session user's own teacher record — body.teacherId is ignored.
    // ADMIN: require a valid teacherId in the body and verify it exists in the DB.
    let teacherId: string
    if (session.user.role === "TEACHER") {
      const teacher = await db.teacher.findUnique({ where: { userId: session.user.id } })
      if (!teacher) return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 })
      teacherId = teacher.id
    } else {
      // ADMIN path
      if (!body.teacherId) return NextResponse.json({ error: "teacherId is required" }, { status: 400 })
      const teacher = await db.teacher.findUnique({ where: { id: body.teacherId } })
      if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
      teacherId = teacher.id
    }

    const mark = await db.mark.upsert({
      where: {
        studentId_subjectId_examType: {
          studentId: data.studentId,
          subjectId: data.subjectId,
          examType: data.examType,
        },
      },
      create: {
        studentId: data.studentId,
        subjectId: data.subjectId,
        teacherId,
        marks: data.marks,
        maxMarks: data.maxMarks,
        examType: data.examType,
        remarks: data.remarks,
      },
      update: {
        marks: data.marks,
        maxMarks: data.maxMarks,
        remarks: data.remarks,
      },
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
        subject: true,
      },
    })

    return NextResponse.json({ mark }, { status: 201 })
  } catch (error: any) {
    console.error("[MARKS POST]", error)
    return NextResponse.json({ error: error.message ?? "Internal server error" }, { status: 500 })
  }
}
