"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"

interface Props {
  enrollmentByYear: Array<{ year: string; students: number }>
  feesByStatus: Array<{ status: string; count: number; amount: number }>
  attendanceByMonth: Array<{ month: string; present: number; absent: number; late: number; total: number }>
  topClasses: Array<{ label: string; students: number }>
  marksByExamType: Array<{ examType: string; avgMarks: number; count: number }>
}

const FEE_COLORS: Record<string, string> = {
  VERIFIED: "#2E8B57",
  SUBMITTED: "#3b82f6",
  PENDING: "#f59e0b",
  REJECTED: "#ef4444",
}

export function AdminAnalyticsClient({ enrollmentByYear, feesByStatus, attendanceByMonth, topClasses, marksByExamType }: Props) {
  const totalStudents = enrollmentByYear.reduce((a, e) => a + e.students, 0)
  const totalFees = feesByStatus.reduce((a, f) => a + f.amount, 0)
  const collectedFees = feesByStatus.find((f) => f.status === "VERIFIED")?.amount ?? 0
  const collectionRate = totalFees > 0 ? Math.round((collectedFees / totalFees) * 100) : 0

  const lastMonth = attendanceByMonth[attendanceByMonth.length - 1]
  const attendanceRate = lastMonth && lastMonth.total > 0
    ? Math.round((lastMonth.present / lastMonth.total) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Analytics Overview</h2>
        <p className="text-sm text-muted-foreground">Key metrics across the institution</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{totalStudents}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-[#2E8B57]">{collectionRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">Fee Collection Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-blue-500">{attendanceRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">Attendance (Last Month)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">₹{(collectedFees / 100000).toFixed(1)}L</p>
            <p className="text-xs text-muted-foreground mt-1">Fees Collected</p>
          </CardContent>
        </Card>
      </div>

      {/* Enrollment & Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Enrollment by Year</CardTitle>
            <CardDescription className="text-xs">Students admitted per academic year</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={enrollmentByYear} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="students" fill="#2E8B57" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Attendance Trends</CardTitle>
            <CardDescription className="text-xs">Present / Absent over last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={attendanceByMonth} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E8B57" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2E8B57" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} />
                <Legend formatter={(v) => <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{v}</span>} />
                <Area type="monotone" dataKey="present" stroke="#2E8B57" strokeWidth={2} fill="url(#presentGrad)" />
                <Area type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} fill="url(#absentGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Fees & Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Fee Status Distribution</CardTitle>
            <CardDescription className="text-xs">By payment status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={feesByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="count" nameKey="status">
                  {feesByStatus.map((entry, i) => (
                    <Cell key={i} fill={FEE_COLORS[entry.status] ?? "#ccc"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} />
                <Legend formatter={(v) => <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Top Classes by Enrollment</CardTitle>
            <CardDescription className="text-xs">Most populated classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topClasses.map((cls, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{cls.label}</span>
                      <span className="text-xs text-muted-foreground">{cls.students}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#2E8B57]"
                        style={{ width: `${topClasses[0] ? (cls.students / topClasses[0].students) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {topClasses.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No class data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Avg Marks by Exam Type</CardTitle>
            <CardDescription className="text-xs">Average scores across exam types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={marksByExamType} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="examType" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="avgMarks" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Avg Marks" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
