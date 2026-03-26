import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? ""
  if (q.length < 2) return NextResponse.json({ results: [] })

  const role = session.user.role
  const isAdminOrPrincipal = role === "ADMIN" || role === "PRINCIPAL"

  const results: Array<{
    id: string
    type: "student" | "teacher" | "class"
    title: string
    subtitle: string
    href: string
  }> = []

  if (isAdminOrPrincipal) {
    const [students, teachers, classes] = await Promise.all([
      db.user.findMany({
        where: {
          role: "STUDENT",
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
        include: { student: { select: { rollNumber: true } } },
        take: 5,
      }),
      db.user.findMany({
        where: {
          role: "TEACHER",
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
        include: { teacher: { select: { employeeId: true } } },
        take: 5,
      }),
      db.class.findMany({
        where: {
          OR: [
            { course: { name: { contains: q, mode: "insensitive" } } },
            { course: { code: { contains: q, mode: "insensitive" } } },
          ],
        },
        include: { course: true },
        take: 5,
      }),
    ])

    const basePath = role === "ADMIN" ? "/dashboard/admin" : "/dashboard/principal"

    students.forEach((u) => results.push({
      id: u.id,
      type: "student",
      title: `${u.firstName} ${u.lastName}`,
      subtitle: u.student?.rollNumber ? `${u.student.rollNumber} · ${u.email}` : u.email,
      href: `${basePath}/students`,
    }))

    teachers.forEach((u) => results.push({
      id: u.id,
      type: "teacher",
      title: `${u.firstName} ${u.lastName}`,
      subtitle: u.teacher?.employeeId ? `${u.teacher.employeeId} · ${u.email}` : u.email,
      href: `${basePath}/teachers`,
    }))

    classes.forEach((c) => results.push({
      id: c.id,
      type: "class",
      title: `${c.course.name} — Year ${c.year} ${c.section}`,
      subtitle: c.course.code,
      href: `${basePath}/classes/${c.id}`,
    }))
  }

  return NextResponse.json({ results })
}
