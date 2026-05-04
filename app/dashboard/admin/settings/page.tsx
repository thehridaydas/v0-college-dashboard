import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { AdminSettingsClient } from "@/components/admin/settings/admin-settings-client"

export const metadata = { title: "Settings | EduManage" }

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions)
  // Middleware guards this route, but keep a server-side fallback for safety
  if (!session || session.user.role !== "ADMIN") redirect("/login")

  const [totalStudents, totalTeachers, totalClasses, totalCourses] = await Promise.all([
    db.student.count(),
    db.teacher.count(),
    db.class.count(),
    db.course.count(),
  ])

  return (
    <AdminSettingsClient
        user={{
          firstName: session.user.firstName,
          lastName: session.user.lastName,
          email: session.user.email ?? "",
          role: session.user.role,
        }}
        systemInfo={{ totalStudents, totalTeachers, totalClasses, totalCourses }}
      />
  )
}
