"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Search, BookOpen, MoreHorizontal, Pencil, Trash2, Users, GraduationCap, BookMarked, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Card, CardContent } from "@/components/ui/card"
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
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-xl font-semibold">Classes</h2>
          <p className="text-sm text-muted-foreground">{classes.length} classes across all courses</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-[#2E8B57] hover:bg-[#266b45] text-white">
          <Plus className="w-4 h-4" />Add Class
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
        <Card><CardContent className="pt-4 pb-3"><p className="text-2xl font-bold">{classes.length}</p><p className="text-xs text-muted-foreground mt-1">Total Classes</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3"><p className="text-2xl font-bold">{classes.reduce((a, c) => a + c.studentCount, 0)}</p><p className="text-xs text-muted-foreground mt-1">Total Students</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3"><p className="text-2xl font-bold">{classes.reduce((a, c) => a + c.subjectCount, 0)}</p><p className="text-xs text-muted-foreground mt-1">Total Subjects</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3"><p className="text-2xl font-bold">{new Set(classes.map((c) => c.courseId)).size}</p><p className="text-xs text-muted-foreground mt-1">Courses</p></CardContent></Card>
      </div>

      {/* Search */}
      <div className="relative shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by course, year, section..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-20">
          <BookOpen className="w-12 h-12 mb-3 opacity-20" />
          <p className="text-sm font-medium">{search ? `No classes matching "${search}"` : "No classes yet"}</p>
          {!search && <p className="text-xs mt-1 opacity-70">Create a class to get started</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1 content-start overflow-y-auto">
          {filtered.map((cls) => (
            <Card
              key={cls.id}
              className="group relative flex flex-col hover:shadow-md transition-shadow cursor-pointer border border-border"
              onClick={() => router.push(`/dashboard/admin/classes/${cls.id}`)}
            >
              {/* Card top accent */}
              <div className="h-1 w-full rounded-t-lg bg-[#2E8B57]" />

              <CardContent className="flex flex-col flex-1 p-4 gap-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-[#2E8B57]/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-[#2E8B57]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-tight">Year {cls.year} &mdash; {cls.section}</p>
                      <p className="text-xs text-muted-foreground font-mono">{cls.courseCode}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEdit(cls) }} className="gap-2 cursor-pointer">
                        <Pencil className="w-3.5 h-3.5" />Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeleteId(cls.id) }} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Course badge */}
                <Badge variant="secondary" className="text-xs font-normal w-fit">{cls.courseName}</Badge>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs">{cls.studentCount} students</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <BookMarked className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs">{cls.subjectCount} subjects</span>
                  </div>
                </div>

                {/* Class teacher */}
                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <GraduationCap className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">
                      {cls.classTeacher ?? "No class teacher"}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground shrink-0">
          Showing {filtered.length} of {classes.length} class{classes.length !== 1 ? "es" : ""}
        </p>
      )}

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
