"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Award, Save, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

interface Student { id: string; name: string; rollNumber: string }
interface SubjectItem {
  subjectId: string
  subjectName: string
  subjectCode: string
  classId: string
  classLabel: string
  students: Student[]
}

interface MarkRecord {
  id: string
  studentId: string
  subjectId: string
  studentName: string
  subjectName: string
  marks: number
  maxMarks: number
  examType: string
  createdAt: Date
}

interface Props {
  teacherId: string
  subjects: SubjectItem[]
  existingMarks: MarkRecord[]
}

type ExamType = "INTERNAL" | "EXTERNAL" | "ASSIGNMENT" | "PRACTICAL"

const EXAM_COLORS: Record<string, string> = {
  INTERNAL: "bg-blue-500/10 text-blue-600",
  EXTERNAL: "bg-purple-500/10 text-purple-600",
  ASSIGNMENT: "bg-amber-500/10 text-amber-600",
  PRACTICAL: "bg-[#2E8B57]/10 text-[#2E8B57]",
}

export function TeacherMarksClient({ teacherId, subjects, existingMarks }: Props) {
  const router = useRouter()
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.subjectId ?? "")
  const [examType, setExamType] = useState<ExamType>("INTERNAL")
  const [maxMarks, setMaxMarks] = useState("100")
  const [marks, setMarks] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  const selectedSubject = subjects.find((s) => s.subjectId === selectedSubjectId)

  const filteredStudents = selectedSubject?.students.filter((s) =>
    `${s.name} ${s.rollNumber}`.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const handleSubmit = async () => {
    if (!selectedSubject) return
    const records = Object.entries(marks)
      .filter(([, v]) => v !== "")
      .map(([studentId, marksValue]) => ({
        studentId,
        subjectId: selectedSubjectId,
        teacherId,
        marks: parseFloat(marksValue),
        maxMarks: parseFloat(maxMarks),
        examType,
      }))

    if (records.length === 0) {
      toast.error("Please enter at least one mark")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to save marks")
      }
      toast.success(`Marks saved for ${records.length} students`)
      setMarks({})
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const filteredHistory = existingMarks.filter(
    (m) => !selectedSubjectId || m.subjectId === selectedSubjectId
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Marks</h2>
        <p className="text-sm text-muted-foreground">Enter and manage student marks for your subjects</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Entry form */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Enter Marks</CardTitle>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                <div className="col-span-2 sm:col-span-1 space-y-1.5">
                  <Label className="text-xs">Subject</Label>
                  <Select value={selectedSubjectId} onValueChange={(v) => { setSelectedSubjectId(v); setMarks({}) }}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.subjectId} value={s.subjectId}>
                          {s.subjectName} ({s.subjectCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Exam Type</Label>
                  <Select value={examType} onValueChange={(v) => setExamType(v as ExamType)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INTERNAL">Internal</SelectItem>
                      <SelectItem value="EXTERNAL">External</SelectItem>
                      <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                      <SelectItem value="PRACTICAL">Practical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Max Marks</Label>
                  <Input
                    type="number"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(e.target.value)}
                    className="h-9 text-sm"
                    min="1"
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {selectedSubject && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm font-semibold">{selectedSubject.classLabel}</CardTitle>
                    <CardDescription className="text-xs">{selectedSubject.students.length} students</CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-xs w-40" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredStudents.map((student) => {
                    const existing = existingMarks.find(
                      (m) => m.studentId === student.id && m.subjectId === selectedSubjectId && m.examType === examType
                    )
                    return (
                      <div key={student.id} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-muted/30">
                        <div>
                          <p className="text-sm font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{student.rollNumber}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {existing && (
                            <span className="text-xs text-muted-foreground">
                              Prev: {existing.marks}/{existing.maxMarks}
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              placeholder="—"
                              value={marks[student.id] ?? ""}
                              onChange={(e) => setMarks((prev) => ({ ...prev, [student.id]: e.target.value }))}
                              className="w-20 h-8 text-sm text-center"
                              min="0"
                              max={maxMarks}
                            />
                            <span className="text-xs text-muted-foreground">/{maxMarks}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="gap-2 bg-[#2E8B57] hover:bg-[#266b45] text-white"
                  >
                    {loading ? <Spinner className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    Save Marks
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Marks History</CardTitle>
            <CardDescription className="text-xs">{filteredHistory.length} entries</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center py-10">
                <Award className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No marks entered</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Student</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.slice(0, 20).map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <p className="text-xs font-medium">{m.studentName}</p>
                          <p className="text-[10px] text-muted-foreground">{m.subjectName}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] border-0 px-1.5 py-0 ${EXAM_COLORS[m.examType] ?? ""}`} variant="secondary">
                            {m.examType.slice(0, 3)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-semibold text-[#2E8B57]">{m.marks}</span>
                          <span className="text-xs text-muted-foreground">/{m.maxMarks}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
