import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { createSubjectSchema } from "@/lib/validations"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const classId = searchParams.get("classId") ?? undefined

    const subjects = await db.subject.findMany({
      where: classId ? { classId } : undefined,
      include: {
        class: { include: { course: true } },
        assignments: {
          include: { teacher: { include: { user: { select: { firstName: true, lastName: true } } } } },
        },
      },
      orderBy: [{ class: { course: { name: "asc" } } }, { code: "asc" }],
    })

    return NextResponse.json({ subjects })
  } catch (error) {
    console.error("[SUBJECTS GET]", error)
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
    const data = createSubjectSchema.parse(body)

    const subject = await db.subject.create({
      data: { classId: data.classId, name: data.name, code: data.code, credits: data.credits },
      include: { class: { include: { course: true } } },
    })

    return NextResponse.json({ subject }, { status: 201 })
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Subject code already exists in this class" }, { status: 409 })
    }
    console.error("[SUBJECTS POST]", error)
    return NextResponse.json({ error: error.message ?? "Internal server error" }, { status: 500 })
  }
}
