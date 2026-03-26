"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Search, BookOpen, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

interface ClassItem {
  id: string
  year: number
  section: string
  courseName: string
  courseCode: string
  courseId: string
  studentCount: number
  subjectCount: number
  classTeacher: string | null
  classTeacherId: string | null
}

interface CourseOption { id: string; name: string; code: string }
interface TeacherOption { id: string; name: string }

interface Props {
  classes: ClassItem[]
  courses: CourseOption[]
  teachers: TeacherOption[]
}

const defaultForm = { courseId: "", year: "1", section: "A", classTeacherId: "" }

export function AdminClassesClient({ classes: initialClasses, courses, teachers }: Props) {
  const router = useRouter()
  const [classes, setClasses] = useState(initialClasses)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editClass, setEditClass] = useState<ClassItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)

  const filtered = classes.filter((c) =>
    `${c.courseName} ${c.courseCode} year${c.year} ${c.section}`.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditClass(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  const openEdit = (c: ClassItem) => {
    setEditClass(c)
    setForm({ courseId: c.courseId, year: c.year.toString(), section: c.section, classTeacherId: c.classTeacherId ?? "" })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.courseId || !form.year || !form.section) {
      toast.error("Course, year and section are required")
      return
    }
    setLoading(true)
    try {
      const url = editClass ? `/api/classes/${editClass.id}` : "/api/classes"
      const method = editClass ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, year: parseInt(form.year) }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to save class")
      }
      toast.success(editClass ? "Class updated" : "Class created")
      setDialogOpen(false)
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/classes/${deleteId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Class deleted")
      setClasses((prev) => prev.filter((c) => c.id !== deleteId))
      setDeleteId(null)
      router.refresh()
    } catch {
      toast.error("Failed to delete class")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Classes</h2>
          <p className="text-sm text-muted-foreground">{classes.length} classes across all courses</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-[#2E8B57] hover:bg-[#266b45] text-white">
          <Plus className="w-4 h-4" />Add Class
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{classes.length}</p><p className="text-xs text-muted-foreground mt-1">Total Classes</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{classes.reduce((a, c) => a + c.studentCount, 0)}</p><p className="text-xs text-muted-foreground mt-1">Total Students</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{classes.reduce((a, c) => a + c.subjectCount, 0)}</p><p className="text-xs text-muted-foreground mt-1">Total Subjects</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{new Set(classes.map((c) => c.courseId)).size}</p><p className="text-xs text-muted-foreground mt-1">Courses</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by course, year, section..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Class</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Course</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Class Teacher</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Students</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Subjects</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No classes found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((cls) => (
                    <TableRow key={cls.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4 text-indigo-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Year {cls.year} - {cls.section}</p>
                            <p className="text-xs text-muted-foreground">{cls.courseCode}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs font-normal">{cls.courseName}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{cls.classTeacher ?? "—"}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{cls.studentCount}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{cls.subjectCount}</span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(cls)} className="gap-2 cursor-pointer">
                              <Pencil className="w-3.5 h-3.5" />Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setDeleteId(cls.id)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                              <Trash2 className="w-3.5 h-3.5" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editClass ? "Edit Class" : "Add New Class"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Course *</Label>
              <Select value={form.courseId} onValueChange={(v) => setForm({ ...form, courseId: v })}>
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} ({c.code})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Year *</Label>
                <Select value={form.year} onValueChange={(v) => setForm({ ...form, year: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((y) => <SelectItem key={y} value={y.toString()}>Year {y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Section *</Label>
                <Select value={form.section} onValueChange={(v) => setForm({ ...form, section: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["A", "B", "C", "D"].map((s) => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Class Teacher</Label>
              <Select value={form.classTeacherId} onValueChange={(v) => setForm({ ...form, classTeacherId: v })}>
                <SelectTrigger><SelectValue placeholder="Select class teacher" /></SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading} className="bg-[#2E8B57] hover:bg-[#266b45] text-white gap-2">
              {loading && <Spinner className="w-4 h-4" />}
              {editClass ? "Save Changes" : "Create Class"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete this class and all associated subjects, enrollments, and attendance records.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive text-destructive-foreground gap-2">
              {loading && <Spinner className="w-4 h-4" />}Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
