"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Search, GraduationCap, Users, BookOpen } from "lucide-react"

interface StudentRow {
  name: string; email: string; rollNumber: string; classLabel: string
  avgScore: number | null; verifiedFees: number; pendingFees: number
}
interface ClassRow { label: string; courseName: string; studentCount: number; subjectCount: number }
interface TeacherRow { name: string; email: string; employeeId: string; department: string | null; classCount: number; subjectCount: number }

export function PrincipalReportsClient({
  studentReport, classReport, teacherReport
}: { studentReport: StudentRow[]; classReport: ClassRow[]; teacherReport: TeacherRow[] }) {
  const [tab, setTab] = useState("students")
  const [search, setSearch] = useState("")

  const filteredStudents = studentReport.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNumber.toLowerCase().includes(search.toLowerCase())
  )
  const filteredTeachers = teacherReport.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) || (t.department ?? "").toLowerCase().includes(search.toLowerCase())
  )
  const filteredClasses = classReport.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase()) || c.courseName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Institution Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Comprehensive data on students, teachers, and classes</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => { setTab(v); setSearch("") }}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <TabsList className="h-9">
            <TabsTrigger value="students" className="text-xs gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> Students</TabsTrigger>
            <TabsTrigger value="teachers" className="text-xs gap-1.5"><Users className="w-3.5 h-3.5" /> Teachers</TabsTrigger>
            <TabsTrigger value="classes" className="text-xs gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Classes</TabsTrigger>
          </TabsList>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input className="pl-8 h-8 text-sm" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Students */}
        <TabsContent value="students" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Student Report</CardTitle>
              <CardDescription className="text-xs">{filteredStudents.length} students</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Student</TableHead>
                      <TableHead className="text-xs">Roll No</TableHead>
                      <TableHead className="text-xs">Class</TableHead>
                      <TableHead className="text-xs">Avg Score</TableHead>
                      <TableHead className="text-xs">Fees Paid</TableHead>
                      <TableHead className="text-xs">Fees Due</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-sm">No students found</TableCell></TableRow>
                    ) : filteredStudents.map((s, i) => (
                      <TableRow key={i} className="hover:bg-muted/30">
                        <TableCell className="text-sm">
                          <p className="font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.email}</p>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{s.rollNumber}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{s.classLabel}</TableCell>
                        <TableCell>
                          {s.avgScore !== null ? (
                            <div className="flex items-center gap-2">
                              <Progress value={s.avgScore} className="h-1.5 w-12" />
                              <span className="text-xs">{s.avgScore}%</span>
                            </div>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-sm font-medium text-[#2E8B57]">₹{s.verifiedFees.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-sm font-medium text-amber-600">₹{s.pendingFees.toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teachers */}
        <TabsContent value="teachers" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Teacher Report</CardTitle>
              <CardDescription className="text-xs">{filteredTeachers.length} teachers</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Teacher</TableHead>
                      <TableHead className="text-xs">Employee ID</TableHead>
                      <TableHead className="text-xs">Department</TableHead>
                      <TableHead className="text-xs">Classes</TableHead>
                      <TableHead className="text-xs">Subjects</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeachers.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8 text-sm">No teachers found</TableCell></TableRow>
                    ) : filteredTeachers.map((t, i) => (
                      <TableRow key={i} className="hover:bg-muted/30">
                        <TableCell className="text-sm">
                          <p className="font-medium">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.email}</p>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{t.employeeId}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{t.department ?? "—"}</TableCell>
                        <TableCell><Badge variant="secondary" className="text-xs">{t.classCount}</Badge></TableCell>
                        <TableCell><Badge variant="secondary" className="text-xs">{t.subjectCount}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Classes */}
        <TabsContent value="classes" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Class Report</CardTitle>
              <CardDescription className="text-xs">{filteredClasses.length} classes</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Class</TableHead>
                      <TableHead className="text-xs">Course</TableHead>
                      <TableHead className="text-xs">Students</TableHead>
                      <TableHead className="text-xs">Subjects</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClasses.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8 text-sm">No classes found</TableCell></TableRow>
                    ) : filteredClasses.map((c, i) => (
                      <TableRow key={i} className="hover:bg-muted/30">
                        <TableCell className="text-sm font-medium">{c.label}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.courseName}</TableCell>
                        <TableCell><Badge className="bg-[#2E8B57]/10 text-[#2E8B57] border-0 text-xs">{c.studentCount}</Badge></TableCell>
                        <TableCell><Badge variant="secondary" className="text-xs">{c.subjectCount}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
