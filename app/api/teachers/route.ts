import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { createTeacherSchema } from "@/lib/validations"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") ?? ""

    const teachers = await db.teacher.findMany({
      where: search
        ? {
            user: {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            },
          }
        : undefined,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        assignments: {
          include: {
            class: { include: { course: true } },
            subject: true,
          },
        },
      },
      orderBy: { employeeId: "asc" },
    })

    return NextResponse.json({ teachers })
  } catch (error) {
    console.error("[TEACHERS GET]", error)
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
    const data = createTeacherSchema.parse(body)
    const hashedPassword = await bcrypt.hash(data.password, 12)

    const user = await db.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "TEACHER",
        teacher: {
          create: {
            employeeId: data.employeeId,
            department: data.department,
            phone: data.phone,
            qualification: data.qualification,
          },
        },
      },
      include: { teacher: true },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Email or employee ID already exists" }, { status: 409 })
    }
    console.error("[TEACHERS POST]", error)
    return NextResponse.json({ error: error.message ?? "Internal server error" }, { status: 500 })
  }
}
