"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Search, Award, TrendingUp } from "lucide-react"
import { format } from "date-fns"

interface Mark {
  id: string
  subjectName: string
  subjectCode: string
  classLabel: string
  teacherName: string
  marks: number
  maxMarks: number
  examType: string
  examDate: string | null
  remarks: string | null
  createdAt: string
}

const EXAM_COLOR: Record<string, string> = {
  INTERNAL: "bg-blue-500/10 text-blue-600 border-0",
  EXTERNAL: "bg-purple-500/10 text-purple-600 border-0",
  ASSIGNMENT: "bg-amber-500/10 text-amber-700 border-0",
  PRACTICAL: "bg-[#2E8B57]/10 text-[#2E8B57] border-0",
}

function getGrade(pct: number) {
  if (pct >= 90) return { label: "O", color: "text-[#2E8B57]" }
  if (pct >= 80) return { label: "A+", color: "text-blue-600" }
  if (pct >= 70) return { label: "A", color: "text-blue-500" }
  if (pct >= 60) return { label: "B+", color: "text-amber-600" }
  if (pct >= 50) return { label: "B", color: "text-amber-500" }
  if (pct >= 40) return { label: "C", color: "text-orange-500" }
  return { label: "F", color: "text-red-600" }
}

export function StudentGradesClient({ marks, studentName }: { marks: Mark[]; studentName: string }) {
  const [search, setSearch] = useState("")
  const [examTypeFilter, setExamTypeFilter] = useState("ALL")

  const filtered = marks.filter((m) => {
    const matchSearch =
      m.subjectName.toLowerCase().includes(search.toLowerCase()) ||
      m.subjectCode.toLowerCase().includes(search.toLowerCase())
    const matchType = examTypeFilter === "ALL" || m.examType === examTypeFilter
    return matchSearch && matchType
  })

  const avgScore = marks.length > 0
    ? Math.round(marks.reduce((a, b) => a + (b.marks / b.maxMarks) * 100, 0) / marks.length)
    : 0

  const highestScore = marks.length > 0
    ? Math.round(Math.max(...marks.map((m) => (m.marks / m.maxMarks) * 100)))
    : 0

  const lowestScore = marks.length > 0
    ? Math.round(Math.min(...marks.map((m) => (m.marks / m.maxMarks) * 100)))
    : 0

  // Chart data - avg per subject
  const subjectMap = new Map<string, { total: number; count: number }>()
  for (const m of marks) {
    const key = m.subjectName
    if (!subjectMap.has(key)) subjectMap.set(key, { total: 0, count: 0 })
    const entry = subjectMap.get(key)!
    entry.total += (m.marks / m.maxMarks) * 100
    entry.count++
  }
  const chartData = Array.from(subjectMap.entries()).map(([name, { total, count }]) => ({
    name: name.length > 10 ? name.substring(0, 10) + "…" : name,
    avg: Math.round(total / count),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">My Grades</h1>
        <p className="text-sm text-muted-foreground mt-1">{studentName} &bull; {marks.length} total marks recorded</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#2E8B57]/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-[#2E8B57]" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Average Score</p>
            <p className="text-2xl font-bold text-[#2E8B57]">{avgScore}%</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Highest</p>
            <p className="text-2xl font-bold text-blue-600">{highestScore}%</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Lowest</p>
            <p className="text-2xl font-bold text-red-500">{lowestScore}%</p>
          </div>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Performance by Subject</CardTitle>
            <CardDescription className="text-xs">Average score per subject</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(v: number) => [`${v}%`, "Average"]}
                />
                <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.avg >= 75 ? "#2E8B57" : entry.avg >= 50 ? "#f59e0b" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <CardTitle className="text-sm font-semibold">All Marks</CardTitle>
              <CardDescription className="text-xs">{filtered.length} records</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  className="pl-8 h-8 text-sm w-44"
                  placeholder="Search subject..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={examTypeFilter} onValueChange={setExamTypeFilter}>
                <SelectTrigger className="h-8 text-sm w-36">
                  <SelectValue placeholder="Exam type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="INTERNAL">Internal</SelectItem>
                  <SelectItem value="EXTERNAL">External</SelectItem>
                  <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                  <SelectItem value="PRACTICAL">Practical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Subject</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Marks</TableHead>
                  <TableHead className="text-xs">Percentage</TableHead>
                  <TableHead className="text-xs">Grade</TableHead>
                  <TableHead className="text-xs">Teacher</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground text-sm py-10">
                      No marks found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((m) => {
                    const pct = Math.round((m.marks / m.maxMarks) * 100)
                    const grade = getGrade(pct)
                    return (
                      <TableRow key={m.id} className="hover:bg-muted/30">
                        <TableCell className="text-sm">
                          <div>
                            <p className="font-medium">{m.subjectName}</p>
                            <p className="text-xs text-muted-foreground font-mono">{m.subjectCode}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${EXAM_COLOR[m.examType] ?? ""}`} variant="secondary">
                            {m.examType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-semibold">{m.marks}/{m.maxMarks}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={pct} className="h-1.5 w-16 bg-muted" />
                            <span className="text-xs text-muted-foreground">{pct}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`text-sm font-bold ${grade.color}`}>{grade.label}</span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{m.teacherName}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {m.examDate ? format(new Date(m.examDate), "dd MMM yyyy") : format(new Date(m.createdAt), "dd MMM yyyy")}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
