"use client"

import { GraduationCap, Users, BookOpen, CreditCard, BarChart3, Bell, TrendingUp } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts"

interface Props {
  stats: {
    totalStudents: number
    totalTeachers: number
    totalClasses: number
    pendingFees: number
    attendanceRate: number
    totalFeeCollected: number
    unreadNotices: number
  }
  recentActivity: Array<{ firstName: string; lastName: string; role: string; email: string; createdAt: Date }>
  monthlyData: Array<{ month: string; students: number }>
  feesByStatus: Array<{ status: string; _count: { status: number }; _sum: { amount: number | null } }>
  attendanceStats: Array<{ status: string; _count: { status: number } }>
}

const FEE_COLORS: Record<string, string> = {
  VERIFIED: "#2E8B57",
  SUBMITTED: "#3b82f6",
  PENDING: "#f59e0b",
  REJECTED: "#ef4444",
}

const ATTENDANCE_COLORS: Record<string, string> = {
  PRESENT: "#2E8B57",
  LATE: "#f59e0b",
  ABSENT: "#ef4444",
}

const ROLE_COLOR: Record<string, string> = {
  ADMIN: "bg-[#2E8B57]/10 text-[#2E8B57]",
  STUDENT: "bg-purple-500/10 text-purple-600",
  TEACHER: "bg-blue-500/10 text-blue-600",
}

export function AdminOverview({ stats, recentActivity, monthlyData, feesByStatus, attendanceStats }: Props) {
  const pieData = feesByStatus.map((f) => ({
    name: f.status,
    value: f._count.status,
    amount: f._sum.amount ?? 0,
  }))

  const attendancePieData = attendanceStats.map((s) => ({
    name: s.status,
    value: s._count.status,
  }))

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          subtitle="Enrolled this year"
          trend={{ value: 8.2 }}
          icon={GraduationCap}
        />
        <StatsCard
          title="Teachers"
          value={stats.totalTeachers}
          subtitle="Active staff"
          trend={{ value: 2.1 }}
          icon={Users}
          iconColor="text-blue-500"
          iconBg="bg-blue-500/10"
        />
        <StatsCard
          title="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          subtitle="Last 30 days"
          trend={{ value: stats.attendanceRate >= 75 ? 3.5 : -2.1 }}
          icon={BarChart3}
          iconColor="text-amber-500"
          iconBg="bg-amber-500/10"
        />
        <StatsCard
          title="Pending Fees"
          value={stats.pendingFees}
          subtitle="Awaiting payment"
          trend={{ value: -5.4 }}
          icon={CreditCard}
          iconColor="text-red-500"
          iconBg="bg-red-500/10"
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Active Classes"
          value={stats.totalClasses}
          subtitle="Across all courses"
          icon={BookOpen}
          iconColor="text-indigo-500"
          iconBg="bg-indigo-500/10"
        />
        <StatsCard
          title="Fee Collected"
          value={`₹${(stats.totalFeeCollected / 100000).toFixed(1)}L`}
          subtitle="Verified payments"
          trend={{ value: 12.3 }}
          icon={TrendingUp}
        />
        <StatsCard
          title="Unread Notices"
          value={stats.unreadNotices}
          subtitle="For your role"
          icon={Bell}
          iconColor="text-orange-500"
          iconBg="bg-orange-500/10"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly enrollment chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Student Enrollment</CardTitle>
            <CardDescription className="text-xs">Monthly new enrollments (last 6 months)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E8B57" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2E8B57" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="students" stroke="#2E8B57" strokeWidth={2} fill="url(#colorStudents)" dot={{ fill: "#2E8B57", r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attendance donut */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Attendance (30 days)</CardTitle>
            <CardDescription className="text-xs">Present / Late / Absent</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={attendancePieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {attendancePieData.map((entry, index) => (
                    <Cell key={index} fill={ATTENDANCE_COLORS[entry.name] ?? "#ccc"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                />
                <Legend
                  formatter={(value) => <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fee status bar chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Fee Status Overview</CardTitle>
            <CardDescription className="text-xs">Breakdown by payment status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={pieData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={FEE_COLORS[entry.name] ?? "#ccc"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Recent Registrations</CardTitle>
            <CardDescription className="text-xs">Latest users added to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No recent activity</p>
              ) : (
                recentActivity.map((user, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs font-semibold">
                        {user.firstName[0]}{user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="secondary" className={`text-xs ${ROLE_COLOR[user.role] ?? ""}`}>
                        {user.role}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
