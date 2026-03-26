"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Search, CreditCard, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"

interface FeeItem {
  id: string
  amount: number
  dueDate: Date
  status: string
  utr: string | null
  description: string | null
  isExtraFee: boolean
  submittedAt: Date | null
  verifiedAt: Date | null
  createdAt: Date
  studentId: string
  studentName: string
  studentEmail: string
  rollNumber: string
  verifiedByName: string | null
}

interface StudentOption { id: string; name: string; rollNumber: string }

interface Props {
  fees: FeeItem[]
  students: StudentOption[]
  summary: { total: number; verified: number; pending: number; submitted: number }
}

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600 border-amber-200",
  SUBMITTED: "bg-blue-500/10 text-blue-600 border-blue-200",
  VERIFIED: "bg-[#2E8B57]/10 text-[#2E8B57] border-[#2E8B57]/20",
  REJECTED: "bg-red-500/10 text-red-600 border-red-200",
}

const defaultForm = {
  studentId: "", amount: "", dueDate: "", description: "", isExtraFee: "false",
}

export function AdminFeesClient({ fees: initialFees, students, summary }: Props) {
  const router = useRouter()
  const [fees, setFees] = useState(initialFees)
  const [search, setSearch] = useState("")
  const [tabFilter, setTabFilter] = useState("ALL")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const filtered = fees.filter((f) => {
    const matchSearch = `${f.studentName} ${f.rollNumber} ${f.utr ?? ""}`.toLowerCase().includes(search.toLowerCase())
    const matchTab = tabFilter === "ALL" || f.status === tabFilter
    return matchSearch && matchTab
  })

  const handleCreate = async () => {
    if (!form.studentId || !form.amount || !form.dueDate) {
      toast.error("Student, amount and due date are required")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
          isExtraFee: form.isExtraFee === "true",
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to create fee")
      }
      toast.success("Fee record created")
      setDialogOpen(false)
      setForm(defaultForm)
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (feeId: string, status: "VERIFIED" | "REJECTED") => {
    setActionLoading(feeId)
    try {
      const res = await fetch(`/api/fees/${feeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Failed to update status")
      toast.success(`Fee ${status.toLowerCase()}`)
      setFees((prev) => prev.map((f) => f.id === feeId ? { ...f, status } : f))
      router.refresh()
    } catch {
      toast.error("Failed to update fee status")
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Fees Management</h2>
          <p className="text-sm text-muted-foreground">{fees.length} fee records total</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2 bg-[#2E8B57] hover:bg-[#266b45] text-white">
          <Plus className="w-4 h-4" />Add Fee Record
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-xs font-medium text-muted-foreground">Total Billed</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-xl font-bold">₹{(summary.total / 1000).toFixed(0)}K</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-xs font-medium text-muted-foreground">Collected</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-xl font-bold text-[#2E8B57]">₹{(summary.verified / 1000).toFixed(0)}K</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-xs font-medium text-muted-foreground">Pending</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-xl font-bold text-amber-500">{summary.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-xs font-medium text-muted-foreground">Submitted</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-xl font-bold text-blue-500">{summary.submitted}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <Tabs value={tabFilter} onValueChange={setTabFilter}>
              <TabsList className="h-8">
                <TabsTrigger value="ALL" className="text-xs px-3">All</TabsTrigger>
                <TabsTrigger value="PENDING" className="text-xs px-3">Pending</TabsTrigger>
                <TabsTrigger value="SUBMITTED" className="text-xs px-3">Submitted</TabsTrigger>
                <TabsTrigger value="VERIFIED" className="text-xs px-3">Verified</TabsTrigger>
                <TabsTrigger value="REJECTED" className="text-xs px-3">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search student, UTR..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Student</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Due Date</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">UTR</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                      <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No fee records found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((fee) => (
                    <TableRow key={fee.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{fee.studentName}</p>
                          <p className="text-xs text-muted-foreground font-mono">{fee.rollNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold">₹{fee.amount.toLocaleString()}</span>
                        {fee.isExtraFee && <Badge variant="outline" className="ml-2 text-xs">Extra</Badge>}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(fee.dueDate), "dd MMM yyyy")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs border ${STATUS_BADGE[fee.status]}`} variant="outline">
                          {fee.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono text-muted-foreground">{fee.utr ?? "—"}</span>
                      </TableCell>
                      <TableCell>
                        {fee.status === "SUBMITTED" && (
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-[#2E8B57] hover:bg-[#2E8B57]/10"
                              onClick={() => handleStatusChange(fee.id, "VERIFIED")}
                              disabled={actionLoading === fee.id}
                            >
                              {actionLoading === fee.id ? <Spinner className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              onClick={() => handleStatusChange(fee.id, "REJECTED")}
                              disabled={actionLoading === fee.id}
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
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
            <DialogTitle>Add Fee Record</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Student *</Label>
              <Select value={form.studentId} onValueChange={(v) => setForm({ ...form, studentId: v })}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.rollNumber})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Amount (₹) *</Label>
                <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="50000" />
              </div>
              <div className="space-y-1.5">
                <Label>Due Date *</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Semester 1 tuition fee" />
            </div>
            <div className="space-y-1.5">
              <Label>Fee Type</Label>
              <Select value={form.isExtraFee} onValueChange={(v) => setForm({ ...form, isExtraFee: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Regular Fee</SelectItem>
                  <SelectItem value="true">Extra Fee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleCreate} disabled={loading} className="bg-[#2E8B57] hover:bg-[#266b45] text-white gap-2">
              {loading && <Spinner className="w-4 h-4" />}Create Fee Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
