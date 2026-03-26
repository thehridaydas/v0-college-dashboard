"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Users, BookMarked, GraduationCap, ChevronUp, ChevronDown,
  Search, BookOpen, UserCheck, ChevronsUpDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface ClassInfo {
  id: string
  year: number
  section: string
  courseName: string
  courseCode: string
  classTeacher: string | null
  classTeacherId: string | null
}

interface Stats {
  studentCount: number
  teacherCount: number
  subjectCount: number
}

interface StudentRow {
  id: string
  firstName: string
  lastName: string
  email: string
  rollNumber: string
  attendancePct: number | null
  enrolledAt: string
}

interface TeacherRow {
  id: string
  firstName: string
  lastName: string
  email: string
  isClassTeacher: boolean
  subjects: string[]
}

interface SubjectRow {
  id: string
  name: string
  code: string
  credits: number
  teacher: string | null
}

interface Props {
  cls: ClassInfo
  stats: Stats
  students: StudentRow[]
  teachers: TeacherRow[]
  subjects: SubjectRow[]
}

type Tab = "students" | "teachers" | "subjects"
type SortDir = "asc" | "desc"

function SortIcon({ dir }: { dir: SortDir | null }) {
  if (!dir) return <ChevronsUpDown className="w-3 h-3 opacity-40" />
  return dir === "asc"
    ? <ChevronUp className="w-3 h-3" />
    : <ChevronDown className="w-3 h-3" />
}

function AttendanceBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-xs text-muted-foreground">No data</span>
  const color = pct >= 75 ? "bg-[#2E8B57]/10 text-[#2E8B57]" : pct >= 60 ? "bg-amber-500/10 text-amber-600" : "bg-destructive/10 text-destructive"
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", color)}>
      {pct}%
    </span>
  )
}

export function ClassDetailClient({ cls, stats, students, teachers, subjects }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("students")
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<string>("name")
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => d === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const sortIcon = (key: string) => <SortIcon dir={sortKey === key ? sortDir : null} />

  // Filtered + sorted students
  const filteredStudents = useMemo(() => {
    const q = search.toLowerCase()
    let rows = students.filter((s) =>
      `${s.firstName} ${s.lastName} ${s.email} ${s.rollNumber}`.toLowerCase().includes(q)
    )
    rows = [...rows].sort((a, b) => {
      let av: string | number = "", bv: string | number = ""
      if (sortKey === "name") { av = `${a.firstName} ${a.lastName}`; bv = `${b.firstName} ${b.lastName}` }
      else if (sortKey === "roll") { av = a.rollNumber; bv = b.rollNumber }
      else if (sortKey === "attendance") { av = a.attendancePct ?? -1; bv = b.attendancePct ?? -1 }
      if (typeof av === "number") return sortDir === "asc" ? av - (bv as number) : (bv as number) - av
      return sortDir === "asc" ? av.localeCompare(bv as string) : (bv as string).localeCompare(av)
    })
    return rows
  }, [students, search, sortKey, sortDir])

  // Filtered + sorted teachers
  const filteredTeachers = useMemo(() => {
    const q = search.toLowerCase()
    let rows = teachers.filter((t) =>
      `${t.firstName} ${t.lastName} ${t.email} ${t.subjects.join(" ")}`.toLowerCase().includes(q)
    )
    rows = [...rows].sort((a, b) => {
      const av = `${a.firstName} ${a.lastName}`
      const bv = `${b.firstName} ${b.lastName}`
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
    })
    return rows
  }, [teachers, search, sortDir])

  // Filtered + sorted subjects
  const filteredSubjects = useMemo(() => {
    const q = search.toLowerCase()
    let rows = subjects.filter((s) =>
      `${s.name} ${s.code} ${s.teacher ?? ""}`.toLowerCase().includes(q)
    )
    rows = [...rows].sort((a, b) => {
      let av: string | number = "", bv: string | number = ""
      if (sortKey === "credits") { av = a.credits; bv = b.credits }
      else { av = a.name; bv = b.name }
      if (typeof av === "number") return sortDir === "asc" ? av - (bv as number) : (bv as number) - av
      return sortDir === "asc" ? av.localeCompare(bv as string) : (bv as string).localeCompare(av)
    })
    return rows
  }, [subjects, search, sortKey, sortDir])

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "students", label: "Students", count: students.length },
    { key: "teachers", label: "Teachers", count: teachers.length },
    { key: "subjects", label: "Subjects", count: subjects.length },
  ]

  const handleTabChange = (t: Tab) => {
    setTab(t)
    setSearch("")
    setSortKey("name")
    setSortDir("asc")
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Back button + breadcrumb */}
      <div className="shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 -ml-2 text-muted-foreground h-8 px-2"
          onClick={() => router.push("/dashboard/admin/classes")}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All Classes
        </Button>
      </div>

      {/* Class header */}
      <div className="shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2E8B57]/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[#2E8B57]" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">{cls.courseName}</h1>
            <p className="text-sm text-muted-foreground">
              Year {cls.year} &mdash; Section {cls.section} &middot; <span className="font-mono">{cls.courseCode}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{stats.studentCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{stats.teacherCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Teachers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2E8B57]/10 flex items-center justify-center shrink-0">
              <BookMarked className="w-4 h-4 text-[#2E8B57]" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{stats.subjectCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Subjects</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight truncate">
                {cls.classTeacher ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Class Teacher</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab card — fills remaining height */}
      <Card className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Tab switcher */}
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-border shrink-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                tab === t.key
                  ? "border-[#2E8B57] text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-full font-normal",
                tab === t.key ? "bg-[#2E8B57]/10 text-[#2E8B57]" : "bg-muted text-muted-foreground"
              )}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-border shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={
                tab === "students" ? "Search by name, roll number, email..."
                  : tab === "teachers" ? "Search by name, email, subject..."
                    : "Search by name, code..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto min-h-0">
          {/* Students tab */}
          {tab === "students" && (
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="pl-4">
                    <button onClick={() => handleSort("name")} className="flex items-center gap-1 text-xs uppercase tracking-wide font-semibold text-muted-foreground hover:text-foreground transition-colors">
                      Student {sortIcon("name")}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => handleSort("roll")} className="flex items-center gap-1 text-xs uppercase tracking-wide font-semibold text-muted-foreground hover:text-foreground transition-colors">
                      Roll No. {sortIcon("roll")}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => handleSort("attendance")} className="flex items-center gap-1 text-xs uppercase tracking-wide font-semibold text-muted-foreground hover:text-foreground transition-colors">
                      Attendance (30d) {sortIcon("attendance")}
                    </button>
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground pr-4">Enrolled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">
                      <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-medium">{search ? `No students matching "${search}"` : "No students enrolled"}</p>
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.map((s) => (
                  <TableRow key={s.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarFallback className="bg-blue-500/10 text-blue-600 text-xs font-bold">
                            {s.firstName[0]}{s.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{s.firstName} {s.lastName}</p>
                          <p className="text-xs text-muted-foreground">{s.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono text-muted-foreground">{s.rollNumber}</span>
                    </TableCell>
                    <TableCell>
                      <AttendanceBadge pct={s.attendancePct} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground pr-4">
                      {new Date(s.enrolledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Teachers tab */}
          {tab === "teachers" && (
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="pl-4">
                    <button onClick={() => handleSort("name")} className="flex items-center gap-1 text-xs uppercase tracking-wide font-semibold text-muted-foreground hover:text-foreground transition-colors">
                      Teacher {sortIcon("name")}
                    </button>
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Role</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground pr-4">Subjects</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-20 text-muted-foreground">
                      <UserCheck className="w-10 h-10 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-medium">{search ? `No teachers matching "${search}"` : "No teachers assigned"}</p>
                    </TableCell>
                  </TableRow>
                ) : filteredTeachers.map((t) => (
                  <TableRow key={t.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarFallback className="bg-amber-500/10 text-amber-600 text-xs font-bold">
                            {t.firstName[0]}{t.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{t.firstName} {t.lastName}</p>
                          <p className="text-xs text-muted-foreground">{t.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {t.isClassTeacher ? (
                        <Badge className="text-xs bg-[#2E8B57]/10 text-[#2E8B57] border-0 font-normal">Class Teacher</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs font-normal">Subject Teacher</Badge>
                      )}
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex flex-wrap gap-1">
                        {t.subjects.length > 0
                          ? t.subjects.map((sub) => (
                            <Badge key={sub} variant="outline" className="text-xs font-normal">{sub}</Badge>
                          ))
                          : <span className="text-xs text-muted-foreground">—</span>
                        }
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Subjects tab */}
          {tab === "subjects" && (
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="pl-4">
                    <button onClick={() => handleSort("name")} className="flex items-center gap-1 text-xs uppercase tracking-wide font-semibold text-muted-foreground hover:text-foreground transition-colors">
                      Subject {sortIcon("name")}
                    </button>
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Code</TableHead>
                  <TableHead>
                    <button onClick={() => handleSort("credits")} className="flex items-center gap-1 text-xs uppercase tracking-wide font-semibold text-muted-foreground hover:text-foreground transition-colors">
                      Credits {sortIcon("credits")}
                    </button>
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground pr-4">Assigned Teacher</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">
                      <BookMarked className="w-10 h-10 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-medium">{search ? `No subjects matching "${search}"` : "No subjects added"}</p>
                    </TableCell>
                  </TableRow>
                ) : filteredSubjects.map((s) => (
                  <TableRow key={s.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#2E8B57]/10 flex items-center justify-center shrink-0">
                          <BookMarked className="w-3.5 h-3.5 text-[#2E8B57]" />
                        </div>
                        <p className="text-sm font-medium">{s.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono text-muted-foreground">{s.code}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs font-normal">{s.credits} credits</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground pr-4">
                      {s.teacher ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Footer count */}
        <div className="px-4 py-2 border-t border-border shrink-0">
          <p className="text-xs text-muted-foreground">
            {tab === "students" && `Showing ${filteredStudents.length} of ${students.length} students`}
            {tab === "teachers" && `Showing ${filteredTeachers.length} of ${teachers.length} teachers`}
            {tab === "subjects" && `Showing ${filteredSubjects.length} of ${subjects.length} subjects`}
          </p>
        </div>
      </Card>
    </div>
  )
}
