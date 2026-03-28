"use client"

import { BookOpen, Users, CreditCard, Award, BookMarked, Bell } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardCalendar } from "@/components/dashboard/dashboard-calendar"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { formatDistanceToNow } from "date-fns"

interface Props {
  teacher: { name: string; employeeId: string; department: string | null }
  stats: {
    myClasses: number
    mySubjects: number
    pendingFees: number
    totalStudentsInClasses: number
  }
  assignments: Array<{
    classLabel: string
    subjectName: string | null
    isClassTeacher: boolean
    studentCount: number
  }>
  recentMarks: Array<{
    studentName: string
    subjectName: string
    marks: number
    maxMarks: number
    examType: string
    createdAt: Date
  }>
  attendanceSummary: Array<{ status: string; _count: { status: number } }>
  recentNotices: Array<{ id: string; title: string; createdAt: Date }>
}

const ATTENDANCE_COLORS: Record<string, string> = {
  PRESENT: "#2E8B57",
  LATE: "#f59e0b",
  ABSENT: "#ef4444",
}

const EXAM_TYPE_COLOR: Record<string, string> = {
  INTERNAL: "bg-blue-500/10 text-blue-600",
  EXTERNAL: "bg-purple-500/10 text-purple-600",
  ASSIGNMENT: "bg-amber-500/10 text-amber-600",
  PRACTICAL: "bg-[#2E8B57]/10 text-[#2E8B57]",
}

export function TeacherOverview({ teacher, stats, assignments, recentMarks, attendanceSummary, recentNotices }: Props) {
  const calendarNotices = recentNotices.map((n) => ({
    id: n.id,
    title: n.title,
    createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt,
  }))
  const attendancePieData = attendanceSummary.map((s) => ({
    name: s.status,
    value: s._count.status,
  }))

  return (
    <div className="flex gap-6 items-start">
    <div className="flex-1 min-w-0 space-y-6">
      {/* Welcome banner */}
      <div className="rounded-xl bg-[#2E8B57] px-6 py-4 text-white flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/70">Welcome back,</p>
          <h2 className="text-lg font-bold mt-0.5">{teacher.name}</h2>
          <p className="text-sm text-white/60 mt-0.5">
            {teacher.department ?? "Faculty"} &bull; ID: {teacher.employeeId}
          </p>
        </div>
        <div className="hidden sm:flex w-12 h-12 rounded-xl bg-white/20 items-center justify-center">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="My Classes" value={stats.myClasses} subtitle="Assigned classes" icon={BookOpen} />
        <StatsCard
          title="My Subjects"
          value={stats.mySubjects}
          subtitle="Teaching subjects"
          icon={BookMarked}
          iconColor="text-blue-500"
          iconBg="bg-blue-500/10"
        />
        <StatsCard
          title="Students"
          value={stats.totalStudentsInClasses}
          subtitle="Across all classes"
          icon={Users}
          iconColor="text-purple-500"
          iconBg="bg-purple-500/10"
        />
        <StatsCard
          title="Pending Fees"
          value={stats.pendingFees}
          subtitle="Awaiting verification"
          icon={CreditCard}
          iconColor={stats.pendingFees > 0 ? "text-amber-500" : "text-[#2E8B57]"}
          iconBg={stats.pendingFees > 0 ? "bg-amber-500/10" : "bg-[#2E8B57]/10"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* My Assignments */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">My Assignments</CardTitle>
            <CardDescription className="text-xs">Classes and subjects you are teaching</CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No assignments found</p>
            ) : (
              <div className="space-y-2">
                {assignments.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#2E8B57]/10 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-[#2E8B57]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{a.classLabel}</p>
                        {a.subjectName && (
                          <p className="text-xs text-muted-foreground">{a.subjectName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.isClassTeacher && (
                        <Badge className="text-xs bg-[#2E8B57]/10 text-[#2E8B57] border-0">Class Teacher</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{a.studentCount} students</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Pie */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Attendance (7 days)</CardTitle>
            <CardDescription className="text-xs">My classes attendance summary</CardDescription>
          </CardHeader>
          <CardContent>
            {attendancePieData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">No attendance data</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={attendancePieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {attendancePieData.map((entry, i) => (
                      <Cell key={i} fill={ATTENDANCE_COLORS[entry.name] ?? "#ccc"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} />
                  <Legend formatter={(v) => <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Marks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Recently Entered Marks</CardTitle>
            <CardDescription className="text-xs">Last 5 mark entries</CardDescription>
          </CardHeader>
          <CardContent>
            {recentMarks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No marks entered yet</p>
            ) : (
              <div className="space-y-3">
                {recentMarks.map((m, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Award className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{m.studentName}</p>
                      <p className="text-xs text-muted-foreground">{m.subjectName}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-semibold text-[#2E8B57]">{m.marks}/{m.maxMarks}</span>
                      <Badge className={`text-[10px] border-0 px-1.5 py-0 ${EXAM_TYPE_COLOR[m.examType] ?? ""}`} variant="secondary">
                        {m.examType}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Notices */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Recent Notices</CardTitle>
            <CardDescription className="text-xs">Latest announcements for teachers</CardDescription>
          </CardHeader>
          <CardContent>
            {recentNotices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No notices</p>
            ) : (
              <div className="space-y-3">
                {recentNotices.map((n) => (
                  <div key={n.id} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#2E8B57]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bell className="w-3.5 h-3.5 text-[#2E8B57]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    <div className="hidden xl:block">
      <DashboardCalendar notices={calendarNotices} />
    </div>
    </div>
  )
}
