import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { createNoticeSchema } from "@/lib/validations"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const notices = await db.notice.findMany({
      where: {
        OR: [
          { targetType: "ALL" },
          { targetType: "ROLE", targetId: session.user.role },
        ],
      },
      include: {
        createdBy: { select: { firstName: true, lastName: true, role: true } },
        recipients: { where: { userId: session.user.id }, select: { isRead: true, readAt: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ notices })
  } catch (error) {
    console.error("[NOTICES GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "PRINCIPAL"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = createNoticeSchema.parse(body)

    const notice = await db.notice.create({
      data: {
        title: data.title,
        content: data.content,
        targetType: data.targetType,
        targetId: data.targetId,
        createdById: session.user.id,
      },
      include: { createdBy: { select: { firstName: true, lastName: true } } },
    })

    // Distribute to relevant users
    let userIds: string[] = []
    if (data.targetType === "ALL") {
      const users = await db.user.findMany({ select: { id: true } })
      userIds = users.map((u) => u.id)
    } else if (data.targetType === "ROLE" && data.targetId) {
      const users = await db.user.findMany({ where: { role: data.targetId as any }, select: { id: true } })
      userIds = users.map((u) => u.id)
    }

    if (userIds.length > 0) {
      await db.noticeRecipient.createMany({
        data: userIds.map((uid) => ({ noticeId: notice.id, userId: uid })),
        skipDuplicates: true,
      })
    }

    return NextResponse.json({ notice }, { status: 201 })
  } catch (error: any) {
    console.error("[NOTICES POST]", error)
    return NextResponse.json({ error: error.message ?? "Internal server error" }, { status: 500 })
  }
}
