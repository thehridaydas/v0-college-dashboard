"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatsCard } from "@/components/dashboard/stats-card"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"
import {
  GraduationCap, Users, BookOpen, LayoutDashboard,
  Bell, CreditCard, UserCheck, TrendingUp,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Props {
  stats: {
    totalStudents: number
    totalTeachers: number
    totalCourses: number
    totalClasses: number
    attendancePct: number
    collectedFees: number
    pendingFeesCount: number
    pendingFeesAmount: number
  }
  recentNotices: Array<{ id: string; title: string; createdByName: string; createdAt: string }>
  topClasses: Array<{ label: string; courseName: string; studentCount: number; subjectCount: number }>
  feeStats: Array<{ status: string; count: number; total: number }>
  principalName: string
}

const FEE_COLORS: Record<string, string> = {
  PENDING: "#94a3b8",
  SUBMITTED: "#f59e0b",
  VERIFIED: "#2E8B57",
  REJECTED: "#ef4444",
}

export function PrincipalOverview({ stats, recentNotices, topClasses, feeStats, principalName }: Props) {
  const classChartData = topClasses.map((c) => ({
    name: c.label,
    students: c.studentCount,
  }))

  const feeChartData = feeStats.map((f) => ({
    name: f.status.charAt(0) + f.status.slice(1).toLowerCase(),
    value: f.count,
    fill: FEE_COLORS[f.status] ?? "#ccc",
  }))

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-xl bg-[#2E8B57] px-6 py-4 text-white flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/70">Principal Dashboard</p>
          <h2 className="text-lg font-bold mt-0.5">{principalName}</h2>
          <p className="text-sm text-white/60 mt-0.5">Institutional Overview &bull; Full Access</p>
        </div>
        <div className="hidden sm:flex w-12 h-12 rounded-xl bg-white/20 items-center justify-center">
          <LayoutDashboard className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Students" value={stats.totalStudents} subtitle="Enrolled students" icon={GraduationCap} />
        <StatsCard
          title="Total Teachers"
          value={stats.totalTeachers}
          subtitle="Teaching staff"
          icon={Users}
          iconColor="text-blue-500"
          iconBg="bg-blue-500/10"
        />
        <StatsCard
          title="Courses"
          value={stats.totalCourses}
          subtitle={`${stats.totalClasses} classes`}
          icon={BookOpen}
          iconColor="text-purple-500"
          iconBg="bg-purple-500/10"
        />
        <StatsCard
          title="Attendance Rate"
          value={`${stats.attendancePct}%`}
          subtitle="All-time average"
          icon={UserCheck}
          iconColor={stats.attendancePct >= 75 ? "text-[#2E8B57]" : "text-amber-500"}
          iconBg={stats.attendancePct >= 75 ? "bg-[#2E8B57]/10" : "bg-amber-500/10"}
        />
      </div>

      {/* Fee stats row */}
      <div className="grid grid-cols-2 gap-4">
        <StatsCard
          title="Fees Collected"
          value={`₹${stats.collectedFees.toLocaleString("en-IN")}`}
          subtitle="Total verified payments"
          icon={CreditCard}
          iconColor="text-[#2E8B57]"
          iconBg="bg-[#2E8B57]/10"
        />
        <StatsCard
          title="Pending Fees"
          value={`₹${stats.pendingFeesAmount.toLocaleString("en-IN")}`}
          subtitle={`${stats.pendingFeesCount} unpaid records`}
          icon={TrendingUp}
          iconColor="text-amber-500"
          iconBg="bg-amber-500/10"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Class enrollment chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Students per Class</CardTitle>
            <CardDescription className="text-xs">Enrollment distribution across classes</CardDescription>
          </CardHeader>
          <CardContent>
            {classChartData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={classChartData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(v: number) => [v, "Students"]}
                  />
                  <Bar dataKey="students" fill="#2E8B57" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Fee distribution pie */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Fee Payment Distribution</CardTitle>
            <CardDescription className="text-xs">Status breakdown across all fee records</CardDescription>
          </CardHeader>
          <CardContent>
            {feeChartData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={feeChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {feeChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(v: number, name: string) => [v, name]}
                  />
                  <Legend formatter={(v) => <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Class overview table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Class Overview</CardTitle>
            <CardDescription className="text-xs">All active classes with enrollment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {topClasses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No classes yet</p>
            ) : (
              topClasses.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#2E8B57]/10 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-[#2E8B57]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{c.label}</p>
                      <p className="text-xs text-muted-foreground">{c.courseName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{c.studentCount}</p>
                    <p className="text-xs text-muted-foreground">{c.subjectCount} subjects</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Notices */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Recent Notices</CardTitle>
            <CardDescription className="text-xs">Latest institutional announcements</CardDescription>
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
                        {n.createdByName} &bull; {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
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
  )
}
