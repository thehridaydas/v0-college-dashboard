"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ClipboardList, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE"

interface Student { id: string; name: string; rollNumber: string }
interface ClassItem { id: string; label: string; students: Student[] }

interface RecentRecord {
  id: string
  date: Date
  status: string
  classId: string
  studentName: string
  rollNumber: string
}

interface Props {
  classes: ClassItem[]
  recentAttendance: RecentRecord[]
}

const STATUS_STYLES: Record<AttendanceStatus, string> = {
  PRESENT: "bg-[#2E8B57] text-white border-[#2E8B57]",
  LATE: "bg-amber-500 text-white border-amber-500",
  ABSENT: "bg-red-500 text-white border-red-500",
}

const STATUS_GHOST: Record<AttendanceStatus, string> = {
  PRESENT: "border-[#2E8B57]/30 text-[#2E8B57] hover:bg-[#2E8B57]/10",
  LATE: "border-amber-300 text-amber-600 hover:bg-amber-500/10",
  ABSENT: "border-red-300 text-red-500 hover:bg-red-500/10",
}

export function TeacherAttendanceClient({ classes, recentAttendance }: Props) {
  const router = useRouter()
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id ?? "")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({})
  const [loading, setLoading] = useState(false)

  const selectedClass = classes.find((c) => c.id === selectedClassId)

  const toggleStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }))
  }

  const markAll = (status: AttendanceStatus) => {
    if (!selectedClass) return
    const all: Record<string, AttendanceStatus> = {}
    selectedClass.students.forEach((s) => { all[s.id] = status })
    setAttendance(all)
  }

  const handleSubmit = async () => {
    if (!selectedClass) return
    const records = selectedClass.students.map((s) => ({
      studentId: s.id,
      classId: selectedClassId,
      date: selectedDate,
      status: attendance[s.id] ?? "PRESENT",
    }))
    setLoading(true)
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to save attendance")
      }
      toast.success(`Attendance saved for ${selectedClass.label}`)
      setAttendance({})
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const presentCount = Object.values(attendance).filter((v) => v === "PRESENT").length
  const absentCount = Object.values(attendance).filter((v) => v === "ABSENT").length
  const lateCount = Object.values(attendance).filter((v) => v === "LATE").length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Attendance</h2>
        <p className="text-sm text-muted-foreground">Mark and track student attendance for your classes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attendance marking */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Mark Attendance</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 mt-3">
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs">Class</Label>
                  <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Date</Label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {selectedClass && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-sm font-semibold">{selectedClass.label}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">{selectedClass.students.length} students</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => markAll("PRESENT")}>All Present</Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs text-red-500 hover:text-red-500 hover:bg-red-500/10 border-red-200" onClick={() => markAll("ABSENT")}>All Absent</Button>
                  </div>
                </div>
                {Object.keys(attendance).length > 0 && (
                  <div className="flex gap-3 mt-3 text-xs">
                    <span className="text-[#2E8B57] font-medium">{presentCount} present</span>
                    <span className="text-amber-500 font-medium">{lateCount} late</span>
                    <span className="text-red-500 font-medium">{absentCount} absent</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedClass.students.map((student) => {
                    const status = attendance[student.id] ?? null
                    return (
                      <div key={student.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-7 h-7">
                            <AvatarFallback className="text-[10px] font-bold bg-purple-500/10 text-purple-600">
                              {student.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{student.rollNumber}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {(["PRESENT", "LATE", "ABSENT"] as AttendanceStatus[]).map((s) => (
                            <button
                              key={s}
                              onClick={() => toggleStatus(student.id, s)}
                              className={cn(
                                "text-xs px-2.5 py-1 rounded-md border font-medium transition-all",
                                status === s ? STATUS_STYLES[s] : `bg-transparent ${STATUS_GHOST[s]}`
                              )}
                            >
                              {s === "PRESENT" ? "P" : s === "LATE" ? "L" : "A"}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || selectedClass.students.length === 0}
                    className="gap-2 bg-[#2E8B57] hover:bg-[#266b45] text-white"
                  >
                    {loading ? <Spinner className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    Save Attendance
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Records */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Recent Records</CardTitle>
            <CardDescription className="text-xs">Last 50 attendance entries</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAttendance.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <ClipboardList className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No records yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {recentAttendance.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-2 py-2 border-b border-border/50 last:border-0">
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{r.studentName}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{r.rollNumber}</p>
                      <p className="text-[10px] text-muted-foreground">{format(new Date(r.date), "dd MMM")}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] shrink-0 border-0",
                        r.status === "PRESENT" ? "bg-[#2E8B57]/10 text-[#2E8B57]"
                          : r.status === "LATE" ? "bg-amber-500/10 text-amber-600"
                          : "bg-red-500/10 text-red-500"
                      )}
                    >
                      {r.status}
                    </Badge>
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
