"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Plus, Search, MoreHorizontal, Pencil, Trash2, GraduationCap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

interface Student {
  id: string
  userId: string
  rollNumber: string
  phone: string | null
  parentName: string | null
  admissionYear: number
  firstName: string
  lastName: string
  email: string
  createdAt: Date
  enrolledClass: string | null
  classId: string | null
  pendingFees: number
}

interface ClassOption { id: string; label: string }

interface Props {
  students: Student[]
  classes: ClassOption[]
}

const defaultForm = {
  firstName: "", lastName: "", email: "", password: "",
  rollNumber: "", phone: "", parentName: "", parentPhone: "",
  admissionYear: new Date().getFullYear().toString(), classId: "",
}

export function AdminStudentsClient({ students: initialStudents, classes }: Props) {
  const router = useRouter()
  const [students, setStudents] = useState(initialStudents)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editStudent, setEditStudent] = useState<Student | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)

  const filtered = students.filter(
    (s) =>
      `${s.firstName} ${s.lastName} ${s.email} ${s.rollNumber}`.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditStudent(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  const openEdit = (s: Student) => {
    setEditStudent(s)
    setForm({
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      password: "",
      rollNumber: s.rollNumber,
      phone: s.phone ?? "",
      parentName: s.parentName ?? "",
      parentPhone: "",
      admissionYear: s.admissionYear.toString(),
      classId: s.classId ?? "",
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.rollNumber) {
      toast.error("Please fill in all required fields")
      return
    }
    if (!editStudent && !form.password) {
      toast.error("Password is required for new students")
      return
    }
    setLoading(true)
    try {
      const url = editStudent ? `/api/students/${editStudent.id}` : "/api/students"
      const method = editStudent ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, admissionYear: parseInt(form.admissionYear) }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to save student")
      }
      toast.success(editStudent ? "Student updated" : "Student created")
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
      const res = await fetch(`/api/students/${deleteId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Student deleted")
      setStudents((prev) => prev.filter((s) => s.id !== deleteId))
      setDeleteId(null)
      router.refresh()
    } catch {
      toast.error("Failed to delete student")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-xl font-semibold">Students</h2>
          <p className="text-sm text-muted-foreground">{students.length} total students enrolled</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-[#2E8B57] hover:bg-[#266b45] text-white">
          <Plus className="w-4 h-4" />
          Add Student
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
        <Card><CardContent className="pt-4 pb-3"><p className="text-2xl font-bold">{students.length}</p><p className="text-xs text-muted-foreground mt-1">Total Students</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3"><p className="text-2xl font-bold">{students.filter((s) => s.enrolledClass).length}</p><p className="text-xs text-muted-foreground mt-1">Enrolled</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3"><p className="text-2xl font-bold text-amber-500">{students.reduce((a, s) => a + s.pendingFees, 0)}</p><p className="text-xs text-muted-foreground mt-1">Pending Fees</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3"><p className="text-2xl font-bold">{new Date().getFullYear()}</p><p className="text-xs text-muted-foreground mt-1">Current Year</p></CardContent></Card>
      </div>

      {/* Table Card — fills remaining height */}
      <Card className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto min-h-0">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow className="border-border/50">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pl-4">Student</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Roll No.</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Class</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Parent</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fees</TableHead>
                <TableHead className="w-10 pr-4" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                    <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">
                      {search ? `No students matching "${search}"` : "No students yet"}
                    </p>
                    {!search && <p className="text-xs mt-1 opacity-70">Add a student to get started</p>}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((student) => (
                  <TableRow key={student.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarFallback className="bg-purple-500/10 text-purple-600 text-xs font-bold">
                            {student.firstName[0]}{student.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><span className="text-sm font-mono text-muted-foreground">{student.rollNumber}</span></TableCell>
                    <TableCell>
                      {student.enrolledClass ? (
                        <Badge variant="secondary" className="text-xs font-normal">{student.enrolledClass}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not enrolled</span>
                      )}
                    </TableCell>
                    <TableCell><span className="text-sm text-muted-foreground">{student.parentName ?? "—"}</span></TableCell>
                    <TableCell>
                      {student.pendingFees > 0 ? (
                        <Badge variant="destructive" className="text-xs">{student.pendingFees} pending</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs bg-[#2E8B57]/10 text-[#2E8B57]">Clear</Badge>
                      )}
                    </TableCell>
                    <TableCell className="pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(student)} className="gap-2 cursor-pointer">
                            <Pencil className="w-3.5 h-3.5" />Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setDeleteId(student.id)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
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

        {filtered.length > 0 && (
          <div className="px-4 py-2 border-t border-border shrink-0">
            <p className="text-xs text-muted-foreground">
              Showing {filtered.length} of {students.length} student{students.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="John" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@college.edu" />
            </div>
            {!editStudent && (
              <div className="space-y-1.5">
                <Label htmlFor="password">Password *</Label>
                <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 8 characters" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="rollNumber">Roll Number *</Label>
                <Input id="rollNumber" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} placeholder="STU001" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admissionYear">Admission Year</Label>
                <Input id="admissionYear" type="number" value={form.admissionYear} onChange={(e) => setForm({ ...form, admissionYear: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="parentName">Parent Name</Label>
                <Input id="parentName" value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} placeholder="Jane Doe" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Assign Class</Label>
              <Select value={form.classId} onValueChange={(v) => setForm({ ...form, classId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading} className="bg-[#2E8B57] hover:bg-[#266b45] text-white gap-2">
              {loading && <Spinner className="w-4 h-4" />}
              {editStudent ? "Save Changes" : "Create Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the student and all their data including attendance, marks, and fees. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2">
              {loading && <Spinner className="w-4 h-4" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
