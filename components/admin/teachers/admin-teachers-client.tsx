"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Search, MoreHorizontal, Pencil, Trash2, UserCheck } from "lucide-react"
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
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

interface Teacher {
  id: string
  userId: string
  employeeId: string
  department: string | null
  phone: string | null
  qualification: string | null
  firstName: string
  lastName: string
  email: string
  createdAt: Date
  classTeacherOf: string | null
  totalAssignments: number
}

interface ClassOption { id: string; label: string }

interface Props {
  teachers: Teacher[]
  classes: ClassOption[]
}

const defaultForm = {
  firstName: "", lastName: "", email: "", password: "",
  employeeId: "", department: "", phone: "", qualification: "",
}

export function AdminTeachersClient({ teachers: initialTeachers }: Props) {
  const router = useRouter()
  const [teachers, setTeachers] = useState(initialTeachers)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)

  const filtered = teachers.filter(
    (t) =>
      `${t.firstName} ${t.lastName} ${t.email} ${t.employeeId} ${t.department ?? ""}`.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditTeacher(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  const openEdit = (t: Teacher) => {
    setEditTeacher(t)
    setForm({
      firstName: t.firstName,
      lastName: t.lastName,
      email: t.email,
      password: "",
      employeeId: t.employeeId,
      department: t.department ?? "",
      phone: t.phone ?? "",
      qualification: t.qualification ?? "",
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.employeeId) {
      toast.error("Please fill in all required fields")
      return
    }
    if (!editTeacher && !form.password) {
      toast.error("Password is required for new teachers")
      return
    }
    setLoading(true)
    try {
      const url = editTeacher ? `/api/teachers/${editTeacher.id}` : "/api/teachers"
      const method = editTeacher ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to save teacher")
      }
      toast.success(editTeacher ? "Teacher updated" : "Teacher created")
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
      const res = await fetch(`/api/teachers/${deleteId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Teacher deleted")
      setTeachers((prev) => prev.filter((t) => t.id !== deleteId))
      setDeleteId(null)
      router.refresh()
    } catch {
      toast.error("Failed to delete teacher")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-xl font-semibold">Teachers</h2>
          <p className="text-sm text-muted-foreground">{teachers.length} teaching staff members</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-[#2E8B57] hover:bg-[#266b45] text-white">
          <Plus className="w-4 h-4" />
          Add Teacher
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 shrink-0">
        <Card><CardContent className="pt-4 pb-3"><p className="text-2xl font-bold">{teachers.length}</p><p className="text-xs text-muted-foreground mt-1">Total Teachers</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3"><p className="text-2xl font-bold">{teachers.filter((t) => t.classTeacherOf).length}</p><p className="text-xs text-muted-foreground mt-1">Class Teachers</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3"><p className="text-2xl font-bold">{new Set(teachers.map((t) => t.department).filter(Boolean)).size}</p><p className="text-xs text-muted-foreground mt-1">Departments</p></CardContent></Card>
      </div>

      {/* Table card — fills remaining height */}
      <Card className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Search aligned with table content */}
        <div className="px-4 py-3 border-b border-border shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, employee ID, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Scrollable table */}
        <div className="flex-1 overflow-auto min-h-0">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground pl-4">Teacher</TableHead>
                <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Employee ID</TableHead>
                <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Department</TableHead>
                <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Class Teacher</TableHead>
                <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Assignments</TableHead>
                <TableHead className="w-10 pr-4" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                    <UserCheck className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">
                      {search ? `No teachers matching "${search}"` : "No teachers yet"}
                    </p>
                    {!search && (
                      <p className="text-xs mt-1 opacity-70">Add a teacher to get started</p>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((teacher) => (
                  <TableRow key={teacher.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarFallback className="bg-blue-500/10 text-blue-600 text-xs font-bold">
                            {teacher.firstName[0]}{teacher.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{teacher.firstName} {teacher.lastName}</p>
                          <p className="text-xs text-muted-foreground">{teacher.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><span className="text-sm font-mono text-muted-foreground">{teacher.employeeId}</span></TableCell>
                    <TableCell>
                      {teacher.department ? (
                        <Badge variant="secondary" className="text-xs font-normal">{teacher.department}</Badge>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">{teacher.classTeacherOf ?? "—"}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{teacher.totalAssignments} classes</Badge>
                    </TableCell>
                    <TableCell className="pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(teacher)} className="gap-2 cursor-pointer">
                            <Pencil className="w-3.5 h-3.5" />Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteId(teacher.id)}
                            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                          >
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

        {/* Footer count */}
        {filtered.length > 0 && (
          <div className="px-4 py-2 border-t border-border shrink-0">
            <p className="text-xs text-muted-foreground">
              Showing {filtered.length} of {teachers.length} teacher{teachers.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTeacher ? "Edit Teacher" : "Add New Teacher"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>First Name *</Label>
                <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Jane" />
              </div>
              <div className="space-y-1.5">
                <Label>Last Name *</Label>
                <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Smith" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@college.edu" />
            </div>
            {!editTeacher && (
              <div className="space-y-1.5">
                <Label>Password *</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 8 characters" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Employee ID *</Label>
                <Input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} placeholder="TCH001" />
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Computer Science" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91..." />
              </div>
              <div className="space-y-1.5">
                <Label>Qualification</Label>
                <Input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} placeholder="M.Tech" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading} className="bg-[#2E8B57] hover:bg-[#266b45] text-white gap-2">
              {loading && <Spinner className="w-4 h-4" />}
              {editTeacher ? "Save Changes" : "Create Teacher"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this teacher and all their data. This action cannot be undone.
            </AlertDialogDescription>
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
