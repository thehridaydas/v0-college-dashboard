"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { StatsCard } from "@/components/dashboard/stats-card"
import { toast } from "sonner"
import { format } from "date-fns"
import { CreditCard, CheckCircle, Clock, Upload, XCircle } from "lucide-react"

interface Fee {
  id: string
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

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-slate-100 text-slate-600 border-0" },
  SUBMITTED: { label: "Submitted", className: "bg-amber-100 text-amber-700 border-0" },
  VERIFIED: { label: "Verified", className: "bg-[#2E8B57]/10 text-[#2E8B57] border-0" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-600 border-0" },
}

export function StudentFeesClient({ fees, studentId }: { fees: Fee[]; studentId: string }) {
  const [list, setList] = useState(fees)
  const [submitFee, setSubmitFee] = useState<Fee | null>(null)
  const [utr, setUtr] = useState("")
  const [loading, setLoading] = useState(false)

  const totalDue = list.filter((f) => f.status === "PENDING" || f.status === "REJECTED").reduce((a, b) => a + b.amount, 0)
  const totalPaid = list.filter((f) => f.status === "VERIFIED").reduce((a, b) => a + b.amount, 0)
  const pendingCount = list.filter((f) => f.status === "PENDING").length
  const submittedCount = list.filter((f) => f.status === "SUBMITTED").length

  const handleSubmit = async () => {
    if (!submitFee) return
    if (!utr.trim()) {
      toast.error("Please enter your UTR/Transaction number")
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/fees/${submitFee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SUBMITTED", utr: utr.trim() }),
      })
      if (!res.ok) throw new Error("Failed to submit")
      setList((prev) =>
        prev.map((f) =>
          f.id === submitFee.id
            ? { ...f, status: "SUBMITTED", utr: utr.trim(), submittedAt: new Date().toISOString() }
            : f
        )
      )
      toast.success("Payment submitted for verification!")
      setSubmitFee(null)
      setUtr("")
    } catch {
      toast.error("Failed to submit payment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">My Fees</h1>
        <p className="text-sm text-muted-foreground mt-1">Track and submit your fee payments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Due" value={`₹${totalDue.toLocaleString("en-IN")}`} subtitle={`${pendingCount} pending`} icon={Clock} iconColor="text-amber-500" iconBg="bg-amber-100" />
        <StatsCard title="Total Paid" value={`₹${totalPaid.toLocaleString("en-IN")}`} subtitle="Verified payments" icon={CheckCircle} iconColor="text-[#2E8B57]" iconBg="bg-[#2E8B57]/10" />
        <StatsCard title="Submitted" value={submittedCount} subtitle="Awaiting verification" icon={Upload} iconColor="text-blue-500" iconBg="bg-blue-100" />
        <StatsCard title="Total Fees" value={list.length} subtitle="All fee records" icon={CreditCard} iconColor="text-purple-500" iconBg="bg-purple-100" />
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Fee Records</CardTitle>
          <CardDescription className="text-xs">Click &quot;Submit&quot; on pending fees to mark them as paid</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="text-xs">Amount</TableHead>
                  <TableHead className="text-xs">Due Date</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">UTR</TableHead>
                  <TableHead className="text-xs">Verified By</TableHead>
                  <TableHead className="text-xs text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground text-sm py-10">
                      No fee records found
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map((fee) => (
                    <TableRow key={fee.id} className="hover:bg-muted/30">
                      <TableCell className="text-sm">
                        <div>
                          <p className="font-medium">{fee.description ?? "Tuition Fee"}</p>
                          {fee.isExtraFee && (
                            <Badge className="text-[10px] bg-purple-100 text-purple-600 border-0 mt-0.5">Extra</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-bold text-[#2E8B57]">
                        ₹{fee.amount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(fee.dueDate), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${STATUS_BADGE[fee.status]?.className}`}>
                          {STATUS_BADGE[fee.status]?.label ?? fee.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {fee.utr ?? <span className="italic text-muted-foreground/50">—</span>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {fee.verifiedByName ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {(fee.status === "PENDING" || fee.status === "REJECTED") && (
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-[#2E8B57] hover:bg-[#25734A] text-white"
                            onClick={() => { setSubmitFee(fee); setUtr("") }}
                          >
                            <Upload className="w-3 h-3 mr-1" /> Submit
                          </Button>
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

      {/* Submit Payment Dialog */}
      <Dialog open={!!submitFee} onOpenChange={() => setSubmitFee(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#2E8B57]" /> Submit Payment
            </DialogTitle>
            <DialogDescription>
              Enter your transaction/UTR number to submit the payment for verification.
            </DialogDescription>
          </DialogHeader>
          {submitFee && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-[#2E8B57]">₹{submitFee.amount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date</span>
                  <span>{format(new Date(submitFee.dueDate), "dd MMM yyyy")}</span>
                </div>
                {submitFee.description && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Description</span>
                    <span>{submitFee.description}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="utr" className="text-sm">UTR / Transaction Number <span className="text-red-500">*</span></Label>
                <Input
                  id="utr"
                  placeholder="e.g. 123456789012"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  You can find this in your bank app or payment confirmation SMS.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitFee(null)}>Cancel</Button>
            <Button
              className="bg-[#2E8B57] hover:bg-[#25734A] text-white"
              disabled={loading || !utr.trim()}
              onClick={handleSubmit}
            >
              {loading ? "Submitting..." : "Submit Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
