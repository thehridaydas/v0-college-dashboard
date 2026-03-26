"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { format } from "date-fns"
import { UserCheck, BookOpen } from "lucide-react"

interface ClassRecord {
  id: string
  classLabel: string
  date: string
  status: string
  remarks: string | null
}

interface SubjectRecord {
  id: string
  subjectName: string
  classLabel: string
  date: string
  status: string
  remarks: string | null
}

const STATUS_BADGE: Record<string, string> = {
  PRESENT: "bg-[#2E8B57]/10 text-[#2E8B57] border-0",
  ABSENT: "bg-red-100 text-red-600 border-0",
  LATE: "bg-amber-100 text-amber-700 border-0",
}

function AttendanceSummary({ records }: { records: Array<{ status: string }> }) {
  const total = records.length
  const present = records.filter((r) => r.status === "PRESENT").length
  const late = records.filter((r) => r.status === "LATE").length
  const absent = records.filter((r) => r.status === "ABSENT").length
  const pct = total > 0 ? Math.round(((present + late) / total) * 100) : 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      <div className="p-3 rounded-lg bg-muted/40 text-center">
        <p className="text-lg font-bold">{total}</p>
        <p className="text-xs text-muted-foreground">Total Sessions</p>
      </div>
      <div className="p-3 rounded-lg bg-[#2E8B57]/10 text-center">
        <p className="text-lg font-bold text-[#2E8B57]">{present}</p>
        <p className="text-xs text-muted-foreground">Present</p>
      </div>
      <div className="p-3 rounded-lg bg-amber-100 text-center">
        <p className="text-lg font-bold text-amber-600">{late}</p>
        <p className="text-xs text-muted-foreground">Late</p>
      </div>
      <div className="p-3 rounded-lg bg-red-100 text-center">
        <p className="text-lg font-bold text-red-600">{absent}</p>
        <p className="text-xs text-muted-foreground">Absent</p>
      </div>
      <div className="col-span-2 sm:col-span-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Attendance Rate</span>
          <span className={`text-xs font-semibold ${pct >= 75 ? "text-[#2E8B57]" : "text-red-500"}`}>{pct}%</span>
        </div>
        <Progress value={pct} className="h-2" />
        {pct < 75 && (
          <p className="text-xs text-red-500 mt-1">Warning: Attendance below 75% threshold</p>
        )}
      </div>
    </div>
  )
}

export function StudentAttendanceClient({
  classAttendance,
  subjectAttendance,
}: {
  classAttendance: ClassRecord[]
  subjectAttendance: SubjectRecord[]
}) {
  const [tab, setTab] = useState("class")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">My Attendance</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your class and subject attendance records</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-9">
          <TabsTrigger value="class" className="text-sm gap-2">
            <UserCheck className="w-3.5 h-3.5" /> Class Attendance
          </TabsTrigger>
          <TabsTrigger value="subject" className="text-sm gap-2">
            <BookOpen className="w-3.5 h-3.5" /> Subject Attendance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="class" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Class Attendance</CardTitle>
              <CardDescription className="text-xs">{classAttendance.length} records total</CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceSummary records={classAttendance} />
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Class</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classAttendance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground text-sm py-8">
                          No attendance records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      classAttendance.map((a) => (
                        <TableRow key={a.id} className="hover:bg-muted/30">
                          <TableCell className="text-sm font-medium">
                            {format(new Date(a.date), "dd MMM yyyy")}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{a.classLabel}</TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${STATUS_BADGE[a.status] ?? ""}`}>{a.status}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{a.remarks ?? "—"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subject" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Subject Attendance</CardTitle>
              <CardDescription className="text-xs">{subjectAttendance.length} records total</CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceSummary records={subjectAttendance} />
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Subject</TableHead>
                      <TableHead className="text-xs">Class</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjectAttendance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground text-sm py-8">
                          No subject attendance records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      subjectAttendance.map((a) => (
                        <TableRow key={a.id} className="hover:bg-muted/30">
                          <TableCell className="text-sm font-medium">
                            {format(new Date(a.date), "dd MMM yyyy")}
                          </TableCell>
                          <TableCell className="text-sm font-medium">{a.subjectName}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{a.classLabel}</TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${STATUS_BADGE[a.status] ?? ""}`}>{a.status}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{a.remarks ?? "—"}</TableCell>
                        </TableRow>
                      ))
                    )}
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
