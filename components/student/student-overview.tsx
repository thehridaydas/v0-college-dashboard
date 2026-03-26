"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Award, Bell, CreditCard, GraduationCap, TrendingUp, UserCheck } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts"

interface Props {
  student: { name: string; rollNumber: string; email: string; classLabel: string }
  attendanceStats: { attendancePct: number; present: number; late: number; absent: number; total: number }
  recentMarks: Array<{ subjectName: string; marks: number; maxMarks: number; examType: string; createdAt: string }>
  feesSummary: Array<{ status: string; count: number; total: number }>
  recentNotices: Array<{ id: string; title: string; createdByName: string; createdAt: string }>
}

const EXAM_COLOR: Record<string, string> = {
  INTERNAL: "bg-blue-500/10 text-blue-600",
  EXTERNAL: "bg-purple-500/10 text-purple-600",
  ASSIGNMENT: "bg-amber-500/10 text-amber-600",
  PRACTICAL: "bg-[#2E8B57]/10 text-[#2E8B57]",
}

const FEE_BADGE: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-600",
  SUBMITTED: "bg-amber-100 text-amber-700",
  VERIFIED: "bg-[#2E8B57]/10 text-[#2E8B57]",
  REJECTED: "bg-red-100 text-red-600",
}

export function StudentOverview({ student, attendanceStats, recentMarks, feesSummary, recentNotices }: Props) {
  const totalFees = feesSummary.reduce((a, b) => a + b.count, 0)
  const pendingFees = feesSummary.find((f) => f.status === "PENDING")?.count ?? 0
  const verifiedFees = feesSummary.find((f) => f.status === "VERIFIED")?.count ?? 0
  const submittedFees = feesSummary.find((f) => f.status === "SUBMITTED")?.count ?? 0

  const avgMarks = recentMarks.length > 0
    ? Math.round(recentMarks.reduce((a, b) => a + (b.marks / b.maxMarks) * 100, 0) / recentMarks.length)
    : 0

  const radialData = [{ name: "Attendance", value: attendanceStats.attendancePct, fill: "#2E8B57" }]

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-xl bg-[#2E8B57] px-6 py-4 text-white flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/70">Welcome back,</p>
          <h2 className="text-lg font-bold mt-0.5">{student.name}</h2>
          <p className="text-sm text-white/60 mt-0.5">
            {student.classLabel} &bull; Roll: {student.rollNumber}
          </p>
        </div>
        <div className="hidden sm:flex w-12 h-12 rounded-xl bg-white/20 items-center justify-center">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Attendance"
          value={`${attendanceStats.attendancePct}%`}
          subtitle={`${attendanceStats.total} sessions tracked`}
          icon={UserCheck}
          iconColor={attendanceStats.attendancePct >= 75 ? "text-[#2E8B57]" : "text-red-500"}
          iconBg={attendanceStats.attendancePct >= 75 ? "bg-[#2E8B57]/10" : "bg-red-500/10"}
        />
        <StatsCard
          title="Avg. Score"
          value={`${avgMarks}%`}
          subtitle={`${recentMarks.length} recent marks`}
          icon={Award}
          iconColor="text-blue-500"
          iconBg="bg-blue-500/10"
        />
        <StatsCard
          title="Total Fees"
          value={totalFees}
          subtitle={`${pendingFees} pending`}
          icon={CreditCard}
          iconColor={pendingFees > 0 ? "text-amber-500" : "text-[#2E8B57]"}
          iconBg={pendingFees > 0 ? "bg-amber-500/10" : "bg-[#2E8B57]/10"}
        />
        <StatsCard
          title="Notices"
          value={recentNotices.length}
          subtitle="Recent announcements"
          icon={Bell}
          iconColor="text-purple-500"
          iconBg="bg-purple-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attendance radial */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Attendance (30 days)</CardTitle>
            <CardDescription className="text-xs">Based on last 30 days records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="relative">
                <ResponsiveContainer width={160} height={160}>
                  <RadialBarChart
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={70}
                    barSize={12}
                    data={radialData}
                    startAngle={90} endAngle={-270}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background dataKey="value" angleAxisId={0} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-[#2E8B57]">{attendanceStats.attendancePct}%</span>
                  <span className="text-[10px] text-muted-foreground">Attendance</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 text-center">
              <div>
                <p className="text-sm font-semibold text-[#2E8B57]">{attendanceStats.present}</p>
                <p className="text-[10px] text-muted-foreground">Present</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-500">{attendanceStats.late}</p>
                <p className="text-[10px] text-muted-foreground">Late</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-red-500">{attendanceStats.absent}</p>
                <p className="text-[10px] text-muted-foreground">Absent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Marks */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Recent Marks</CardTitle>
            <CardDescription className="text-xs">Latest 5 exam results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentMarks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No marks recorded yet</p>
            ) : (
              recentMarks.map((m, i) => {
                const pct = Math.round((m.marks / m.maxMarks) * 100)
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{m.subjectName}</span>
                        <Badge className={`text-[10px] border-0 px-1.5 py-0 ${EXAM_COLOR[m.examType] ?? ""}`} variant="secondary">
                          {m.examType}
                        </Badge>
                      </div>
                      <span className="font-semibold text-[#2E8B57]">{m.marks}/{m.maxMarks}</span>
                    </div>
                    <Progress value={pct} className="h-1.5 bg-muted" />
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fee Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Fee Summary</CardTitle>
            <CardDescription className="text-xs">Your fee payment overview</CardDescription>
          </CardHeader>
          <CardContent>
            {feesSummary.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No fee records</p>
            ) : (
              <div className="space-y-3">
                {feesSummary.map((f) => (
                  <div key={f.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${f.status === "VERIFIED" ? "bg-[#2E8B57]" : f.status === "SUBMITTED" ? "bg-amber-400" : f.status === "REJECTED" ? "bg-red-500" : "bg-slate-400"}`} />
                      <Badge className={`text-xs border-0 ${FEE_BADGE[f.status] ?? ""}`}>{f.status}</Badge>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold">₹{f.total.toLocaleString("en-IN")}</span>
                      <span className="text-xs text-muted-foreground ml-1">({f.count})</span>
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
            <CardDescription className="text-xs">Latest announcements for you</CardDescription>
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
