import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AdminSettingsClient } from "@/components/admin/settings/admin-settings-client"

export const metadata = { title: "Settings | EduManage" }

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") redirect("/login")

  const [totalStudents, totalTeachers, totalClasses, totalCourses] = await Promise.all([
    db.student.count(),
    db.teacher.count(),
    db.class.count(),
    db.course.count(),
  ])

  return (
    <DashboardShell pageTitle="Settings">
      <AdminSettingsClient
        user={{
          firstName: session.user.firstName,
          lastName: session.user.lastName,
          email: session.user.email ?? "",
          role: session.user.role,
        }}
        systemInfo={{ totalStudents, totalTeachers, totalClasses, totalCourses }}
      />
    </DashboardShell>
  )
}
