import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Briefcase, Mail, Phone, Award, CalendarDays } from "lucide-react"
import { format } from "date-fns"

export const metadata = { title: "My Profile | EduManage" }

export default async function TeacherProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "TEACHER") redirect("/login")

  const teacher = await db.teacher.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      assignments: {
        include: {
          class: { include: { course: true } },
          subject: true,
        },
      },
    },
  })
  if (!teacher) redirect("/login")

  const uniqueClasses = new Set(teacher.assignments.map((a) => a.classId)).size
  const subjects = teacher.assignments.filter((a) => a.subject).map((a) => a.subject!.name)
  const classTeacherOf = teacher.assignments.filter((a) => a.isClassTeacher)
  const initials = `${teacher.user.firstName[0]}${teacher.user.lastName[0]}`

  return (
    <div className="max-w-2xl space-y-6">
        {/* Profile card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-[#2E8B57] text-white text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold">{teacher.user.firstName} {teacher.user.lastName}</h2>
                <p className="text-sm text-muted-foreground">{teacher.department ?? "Faculty"}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge className="bg-blue-500/10 text-blue-600 border-0 text-xs">Teacher</Badge>
                  <Badge variant="outline" className="text-xs font-mono">{teacher.employeeId}</Badge>
                  {classTeacherOf.length > 0 && (
                    <Badge className="bg-[#2E8B57]/10 text-[#2E8B57] border-0 text-xs">Class Teacher</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { icon: Mail, label: "Email", value: teacher.user.email },
              { icon: Phone, label: "Phone", value: teacher.phone ?? "Not provided" },
              { icon: Award, label: "Qualification", value: teacher.qualification ?? "Not provided" },
              { icon: Briefcase, label: "Department", value: teacher.department ?? "Not assigned" },
              {
                icon: CalendarDays,
                label: "Joining Date",
                value: teacher.joiningDate ? format(new Date(teacher.joiningDate), "dd MMMM yyyy") : "Not provided",
              },
            ].map((item, i, arr) => (
              <div key={item.label}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-medium text-right">{item.value}</span>
                  </div>
                </div>
                {i < arr.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Teaching */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Teaching Assignments</CardTitle>
            <CardDescription className="text-xs">{uniqueClasses} classes, {subjects.length} subjects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {teacher.assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No assignments yet</p>
            ) : (
              teacher.assignments.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#2E8B57]/10 flex items-center justify-center">
                      <BookOpen className="w-3.5 h-3.5 text-[#2E8B57]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {a.class.course.code} - Year {a.class.year}{a.class.section}
                      </p>
                      {a.subject && <p className="text-xs text-muted-foreground">{a.subject.name}</p>}
                    </div>
                  </div>
                  {a.isClassTeacher && (
                    <Badge className="bg-[#2E8B57]/10 text-[#2E8B57] border-0 text-xs">Class Teacher</Badge>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
  )
}
