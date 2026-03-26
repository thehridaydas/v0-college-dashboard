"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Search, BookMarked, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
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

interface SubjectItem {
  id: string
  name: string
  code: string
  credits: number
  classId: string
  className: string
  teacher: string | null
  marksCount: number
}

interface ClassOption { id: string; label: string }
interface TeacherOption { id: string; name: string }

interface Props {
  subjects: SubjectItem[]
  classes: ClassOption[]
  teachers: TeacherOption[]
}

const defaultForm = { name: "", code: "", credits: "4", classId: "", teacherId: "" }

export function AdminSubjectsClient({ subjects: initial, classes, teachers }: Props) {
  const router = useRouter()
  const [subjects, setSubjects] = useState(initial)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editSubject, setEditSubject] = useState<SubjectItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)

  const filtered = subjects.filter((s) =>
    `${s.name} ${s.code} ${s.className}`.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditSubject(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  const openEdit = (s: SubjectItem) => {
    setEditSubject(s)
    setForm({ name: s.name, code: s.code, credits: s.credits.toString(), classId: s.classId, teacherId: "" })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.name || !form.code || !form.classId) {
      toast.error("Name, code, and class are required")
      return
    }
    setLoading(true)
    try {
      const url = editSubject ? `/api/subjects/${editSubject.id}` : "/api/subjects"
      const method = editSubject ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, credits: parseInt(form.credits) }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to save subject")
      }
      toast.success(editSubject ? "Subject updated" : "Subject created")
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
      const res = await fetch(`/api/subjects/${deleteId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Subject deleted")
      setSubjects((prev) => prev.filter((s) => s.id !== deleteId))
      setDeleteId(null)
      router.refresh()
    } catch {
      toast.error("Failed to delete subject")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Subjects</h2>
          <p className="text-sm text-muted-foreground">{subjects.length} subjects across all classes</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-[#2E8B57] hover:bg-[#266b45] text-white">
          <Plus className="w-4 h-4" />Add Subject
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{subjects.length}</p><p className="text-xs text-muted-foreground mt-1">Total Subjects</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{subjects.filter((s) => s.teacher).length}</p><p className="text-xs text-muted-foreground mt-1">With Teachers</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{subjects.reduce((a, s) => a + s.marksCount, 0)}</p><p className="text-xs text-muted-foreground mt-1">Total Marks Entered</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by subject name, code, class..."
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
                  <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Subject</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Code</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Class</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Teacher</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Credits</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                      <BookMarked className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No subjects found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((sub) => (
                    <TableRow key={sub.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <BookMarked className="w-4 h-4 text-amber-500" />
                          </div>
                          <span className="text-sm font-medium">{sub.name}</span>
                        </div>
                      </TableCell>
                      <TableCell><span className="font-mono text-sm text-muted-foreground">{sub.code}</span></TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs font-normal">{sub.className}</Badge></TableCell>
                      <TableCell><span className="text-sm text-muted-foreground">{sub.teacher ?? "—"}</span></TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{sub.credits} credits</Badge></TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(sub)} className="gap-2 cursor-pointer"><Pencil className="w-3.5 h-3.5" />Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setDeleteId(sub.id)} className="gap-2 cursor-pointer text-destructive focus:text-destructive"><Trash2 className="w-3.5 h-3.5" />Delete</DropdownMenuItem>
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
            <DialogTitle>{editSubject ? "Edit Subject" : "Add New Subject"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Subject Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Data Structures" />
              </div>
              <div className="space-y-1.5">
                <Label>Code *</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="CS201" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Credits</Label>
                <Select value={form.credits} onValueChange={(v) => setForm({ ...form, credits: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((c) => <SelectItem key={c} value={c.toString()}>{c} credits</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Class *</Label>
                <Select value={form.classId} onValueChange={(v) => setForm({ ...form, classId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Assign Teacher</Label>
              <Select value={form.teacherId} onValueChange={(v) => setForm({ ...form, teacherId: v })}>
                <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
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
              {editSubject ? "Save Changes" : "Create Subject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subject</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete this subject along with all marks and attendance records associated with it.</AlertDialogDescription>
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
