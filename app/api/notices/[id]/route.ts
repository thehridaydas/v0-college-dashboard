import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN", "TEACHER", "PRINCIPAL"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const notice = await db.notice.findUnique({ where: { id } })
    if (!notice) return NextResponse.json({ error: "Notice not found" }, { status: 404 })

    // Only the creator or admin can delete
    if (notice.createdById !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await db.notice.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Notices DELETE]", error)
    return NextResponse.json({ error: "Failed to delete notice" }, { status: 500 })
  }
}
