"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, Users, Search, ChevronRight } from "lucide-react"

interface ClassInfo {
  classId: string
  classLabel: string
  courseName: string
  isClassTeacher: boolean
  subjects: string[]
  studentCount: number
  students: Array<{ id: string; name: string; rollNumber: string; email: string }>
}

export function TeacherClassesClient({ classes }: { classes: ClassInfo[] }) {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<ClassInfo | null>(null)
  const [studentSearch, setStudentSearch] = useState("")

  const filtered = classes.filter((c) =>
    c.classLabel.toLowerCase().includes(search.toLowerCase()) ||
    c.courseName.toLowerCase().includes(search.toLowerCase())
  )

  const filteredStudents = selected?.students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase())
  ) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">My Classes</h1>
        <p className="text-sm text-muted-foreground mt-1">All classes and students assigned to you</p>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          className="pl-8 h-9 text-sm"
          placeholder="Search classes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Class cards grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            No classes found
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((cls) => (
            <Card key={cls.classId} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setSelected(cls)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2E8B57]/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-[#2E8B57]" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors mt-1" />
                </div>
                <h3 className="font-semibold text-sm mb-0.5">{cls.classLabel}</h3>
                <p className="text-xs text-muted-foreground mb-3">{cls.courseName}</p>

                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {cls.studentCount} students
                  </span>
                  {cls.isClassTeacher && (
                    <Badge className="text-[10px] bg-[#2E8B57]/10 text-[#2E8B57] border-0">Class Teacher</Badge>
                  )}
                </div>

                {cls.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {cls.subjects.slice(0, 3).map((s) => (
                      <Badge key={s} variant="secondary" className="text-[10px] font-normal">{s}</Badge>
                    ))}
                    {cls.subjects.length > 3 && (
                      <Badge variant="secondary" className="text-[10px] font-normal">+{cls.subjects.length - 3} more</Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Student List Dialog */}
      <Dialog open={!!selected} onOpenChange={() => { setSelected(null); setStudentSearch("") }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#2E8B57]" />
              {selected?.classLabel}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-[#2E8B57]/10 text-[#2E8B57] border-0 text-xs">{selected?.studentCount} Students</Badge>
              {selected?.subjects.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs font-normal">{s}</Badge>
              ))}
              {selected?.isClassTeacher && (
                <Badge className="bg-blue-100 text-blue-600 border-0 text-xs">Class Teacher</Badge>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                className="pl-8 h-8 text-sm"
                placeholder="Search students..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs h-9">#</TableHead>
                    <TableHead className="text-xs h-9">Student Name</TableHead>
                    <TableHead className="text-xs h-9">Roll Number</TableHead>
                    <TableHead className="text-xs h-9">Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground text-sm py-6">
                        No students found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((s, i) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="text-sm font-medium">{s.name}</TableCell>
                        <TableCell className="text-sm font-mono text-muted-foreground">{s.rollNumber}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{s.email}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
