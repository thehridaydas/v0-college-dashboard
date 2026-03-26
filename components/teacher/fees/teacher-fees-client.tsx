"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { StatsCard } from "@/components/dashboard/stats-card"
import { toast } from "sonner"
import { format } from "date-fns"
import { Search, CheckCircle, XCircle, Eye, CreditCard, Clock, AlertCircle } from "lucide-react"

interface Fee {
  id: string
  studentName: string
  studentEmail: string
  rollNumber: string
  classLabel: string
  amount: number
  dueDate: string
  status: string
  utr: string | null
  description: string | null
  isExtraFee: boolean
  submittedAt: string | null
  verifiedAt: string | null
  verifiedByName: string | null
  createdAt: string
}

interface Props {
  fees: Fee[]
  summary: { pending: number; submitted: number; verified: number; rejected: number; totalAmount: number }
  teacherId: string
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-slate-100 text-slate-600 border-0" },
  SUBMITTED: { label: "Submitted", className: "bg-amber-100 text-amber-700 border-0" },
  VERIFIED: { label: "Verified", className: "bg-[#2E8B57]/10 text-[#2E8B57] border-0" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-600 border-0" },
}

export function TeacherFeesClient({ fees, summary, teacherId }: Props) {
  const [list, setList] = useState(fees)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [selected, setSelected] = useState<Fee | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ fee: Fee; action: "verify" | "reject" } | null>(null)

  const filtered = list.filter((f) => {
    const matchSearch =
      f.studentName.toLowerCase().includes(search.toLowerCase()) ||
      f.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      (f.utr ?? "").toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "ALL" || f.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleAction = async (feeId: string, action: "verify" | "reject") => {
    setLoading(true)
    const newStatus = action === "verify" ? "VERIFIED" : "REJECTED"
    try {
      const res = await fetch(`/api/fees/${feeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, verifiedByTeacherId: teacherId }),
      })
      if (!res.ok) throw new Error("Failed to update")
      setList((prev) =>
        prev.map((f) =>
          f.id === feeId
            ? { ...f, status: newStatus, verifiedAt: new Date().toISOString() }
            : f
        )
      )
      toast.success(`Fee ${action === "verify" ? "verified" : "rejected"} successfully`)
      setConfirmAction(null)
      setSelected(null)
    } catch {
      toast.error("Failed to update fee status")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Fee Verification</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and verify student fee submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Pending" value={summary.pending} subtitle="Not yet submitted" icon={Clock} iconColor="text-slate-500" iconBg="bg-slate-100" />
        <StatsCard title="Submitted" value={summary.submitted} subtitle="Awaiting verification" icon={AlertCircle} iconColor="text-amber-500" iconBg="bg-amber-100" />
        <StatsCard title="Verified" value={summary.verified} subtitle="Approved payments" icon={CheckCircle} iconColor="text-[#2E8B57]" iconBg="bg-[#2E8B57]/10" />
        <StatsCard title="Rejected" value={summary.rejected} subtitle="Declined payments" icon={XCircle} iconColor="text-red-500" iconBg="bg-red-100" />
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <CardTitle className="text-sm font-semibold">All Fee Records</CardTitle>
              <CardDescription className="text-xs">{filtered.length} records found</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  className="pl-8 h-8 text-sm w-48"
                  placeholder="Search student, UTR..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-sm w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="VERIFIED">Verified</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Student</TableHead>
                  <TableHead className="text-xs">Class</TableHead>
                  <TableHead className="text-xs">Amount</TableHead>
                  <TableHead className="text-xs">Due Date</TableHead>
                  <TableHead className="text-xs">UTR</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground text-sm py-10">
                      No fee records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((fee) => (
                    <TableRow key={fee.id} className="hover:bg-muted/30">
                      <TableCell className="text-sm">
                        <div>
                          <p className="font-medium">{fee.studentName}</p>
                          <p className="text-xs text-muted-foreground">{fee.rollNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{fee.classLabel}</TableCell>
                      <TableCell className="text-sm font-semibold">
                        ₹{fee.amount.toLocaleString("en-IN")}
                        {fee.isExtraFee && (
                          <Badge className="ml-1 text-[10px] bg-purple-100 text-purple-600 border-0">Extra</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(fee.dueDate), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">
                        {fee.utr ?? <span className="text-muted-foreground/50 italic">Not provided</span>}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${STATUS_BADGE[fee.status]?.className}`}>
                          {STATUS_BADGE[fee.status]?.label ?? fee.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setSelected(fee)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {fee.status === "SUBMITTED" && (
                            <>
                              <Button
                                size="sm"
                                className="h-7 px-2 bg-[#2E8B57] hover:bg-[#25734A] text-white"
                                onClick={() => setConfirmAction({ fee, action: "verify" })}
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => setConfirmAction({ fee, action: "reject" })}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#2E8B57]" />
              Fee Details
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Student</p>
                  <p className="font-medium">{selected.studentName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Roll Number</p>
                  <p className="font-medium">{selected.rollNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Class</p>
                  <p className="font-medium">{selected.classLabel}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="font-bold text-[#2E8B57]">₹{selected.amount.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Due Date</p>
                  <p className="font-medium">{format(new Date(selected.dueDate), "dd MMM yyyy")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={`text-xs ${STATUS_BADGE[selected.status]?.className}`}>
                    {STATUS_BADGE[selected.status]?.label}
                  </Badge>
                </div>
                {selected.utr && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">UTR Number</p>
                    <p className="font-mono font-medium">{selected.utr}</p>
                  </div>
                )}
                {selected.description && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p>{selected.description}</p>
                  </div>
                )}
                {selected.submittedAt && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Submitted At</p>
                    <p>{format(new Date(selected.submittedAt), "dd MMM yyyy, hh:mm a")}</p>
                  </div>
                )}
                {selected.verifiedAt && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Verified At</p>
                    <p>{format(new Date(selected.verifiedAt), "dd MMM yyyy, hh:mm a")}</p>
                  </div>
                )}
              </div>
              {selected.status === "SUBMITTED" && (
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1 bg-[#2E8B57] hover:bg-[#25734A] text-white"
                    onClick={() => setConfirmAction({ fee: selected, action: "verify" })}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Verify
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => setConfirmAction({ fee: selected, action: "reject" })}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm action dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.action === "verify" ? "Verify Payment" : "Reject Payment"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.action === "verify"
                ? `Are you sure you want to verify the ₹${confirmAction?.fee.amount.toLocaleString("en-IN")} payment from ${confirmAction?.fee.studentName}?`
                : `Are you sure you want to reject the payment from ${confirmAction?.fee.studentName}? This will notify the student.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button
              className={confirmAction?.action === "verify" ? "bg-[#2E8B57] hover:bg-[#25734A] text-white" : "bg-red-600 hover:bg-red-700 text-white"}
              disabled={loading}
              onClick={() => confirmAction && handleAction(confirmAction.fee.id, confirmAction.action)}
            >
              {loading ? "Processing..." : confirmAction?.action === "verify" ? "Verify" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
