import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { markAttendanceSchema } from "@/lib/validations"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const classId = searchParams.get("classId") ?? undefined
    const studentId = searchParams.get("studentId") ?? undefined
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {}
    if (classId) where.classId = classId
    if (studentId) where.studentId = studentId
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const attendance = await db.classAttendance.findMany({
      where,
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
        class: { include: { course: true } },
      },
      orderBy: { date: "desc" },
    })

    return NextResponse.json({ attendance })
  } catch (error) {
    console.error("[ATTENDANCE GET]", error)
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
    const data = markAttendanceSchema.parse(body)
    const date = new Date(data.date)

    const results = await Promise.all(
      data.attendance.map((a) =>
        db.classAttendance.upsert({
          where: {
            studentId_classId_date: {
              studentId: a.studentId,
              classId: data.classId,
              date,
            },
          },
          create: { studentId: a.studentId, classId: data.classId, date, status: a.status },
          update: { status: a.status },
        })
      )
    )

    return NextResponse.json({ message: "Attendance marked", count: results.length })
  } catch (error: any) {
    console.error("[ATTENDANCE POST]", error)
    return NextResponse.json({ error: error.message ?? "Internal server error" }, { status: 500 })
  }
}
