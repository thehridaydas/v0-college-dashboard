import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { createStudentSchema } from "@/lib/validations"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") ?? ""
    const classId = searchParams.get("classId") ?? undefined
    const page = parseInt(searchParams.get("page") ?? "1")
    const limit = parseInt(searchParams.get("limit") ?? "20")
    const skip = (page - 1) * limit

    const where = {
      user: {
        OR: search
          ? [
              { firstName: { contains: search, mode: "insensitive" as const } },
              { lastName: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ]
          : undefined,
      },
      ...(classId && {
        enrollments: { some: { classId } },
      }),
    }

    const [students, total] = await Promise.all([
      db.student.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true, createdAt: true } },
          enrollments: { include: { class: { include: { course: true } } } },
        },
        skip,
        take: limit,
        orderBy: { rollNumber: "asc" },
      }),
      db.student.count({ where }),
    ])

    return NextResponse.json({ students, total, page, limit })
  } catch (error) {
    console.error("[STUDENTS GET]", error)
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
    const data = createStudentSchema.parse(body)
    const hashedPassword = await bcrypt.hash(data.password, 12)

    const user = await db.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "STUDENT",
        student: {
          create: {
            rollNumber: data.rollNumber,
            phone: data.phone,
            address: data.address,
            parentName: data.parentName,
            parentPhone: data.parentPhone,
            admissionYear: data.admissionYear,
            ...(data.classId && {
              enrollments: { create: { classId: data.classId } },
            }),
          },
        },
      },
      include: { student: true },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Email or roll number already exists" }, { status: 409 })
    }
    console.error("[STUDENTS POST]", error)
    return NextResponse.json({ error: error.message ?? "Internal server error" }, { status: 500 })
  }
}
