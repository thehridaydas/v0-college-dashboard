import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { createClassSchema } from "@/lib/validations"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const teacherId = searchParams.get("teacherId") ?? undefined

    const classes = await db.class.findMany({
      where: teacherId
        ? { assignments: { some: { teacherId } } }
        : undefined,
      include: {
        course: true,
        subjects: true,
        enrollments: { include: { student: { include: { user: { select: { firstName: true, lastName: true } } } } } },
        assignments: {
          include: {
            teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
            subject: true,
          },
        },
      },
      orderBy: [{ course: { name: "asc" } }, { year: "asc" }, { section: "asc" }],
    })

    return NextResponse.json({ classes })
  } catch (error) {
    console.error("[CLASSES GET]", error)
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
    const data = createClassSchema.parse(body)

    const cls = await db.class.create({
      data: { courseId: data.courseId, year: data.year, section: data.section },
      include: { course: true },
    })

    return NextResponse.json({ class: cls }, { status: 201 })
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Class already exists" }, { status: 409 })
    }
    console.error("[CLASSES POST]", error)
    return NextResponse.json({ error: error.message ?? "Internal server error" }, { status: 500 })
  }
}
