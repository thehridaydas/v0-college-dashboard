"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Bell, Trash2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { formatDistanceToNow } from "date-fns"

interface NoticeItem {
  id: string
  title: string
  content: string
  targetType: string
  targetId: string | null
  createdAt: string
  createdByName: string
}

interface ClassOption {
  id: string
  label: string
}

interface Props {
  notices: NoticeItem[]
  canCreate: boolean
  userId: string
  userRole: string
  classes?: ClassOption[]
}

const TARGET_LABELS: Record<string, string> = {
  ALL: "Everyone",
  CLASS: "Class",
  ROLE: "Role",
}

const defaultForm = { title: "", content: "", targetType: "ALL", targetId: "" }

export function NoticesClient({ notices: initial, canCreate, classes = [] }: Props) {
  const router = useRouter()
  const [notices, setNotices] = useState(initial)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!form.title || !form.content) {
      toast.error("Title and content are required")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to create notice")
      }
      toast.success("Notice published")
      setDialogOpen(false)
      setForm(defaultForm)
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
      const res = await fetch(`/api/notices/${deleteId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Notice deleted")
      setNotices((prev) => prev.filter((n) => n.id !== deleteId))
      setDeleteId(null)
    } catch {
      toast.error("Failed to delete notice")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Notice Board</h1>
          <p className="text-sm text-muted-foreground mt-1">{notices.length} notices published</p>
        </div>
        {canCreate && (
          <Button
            onClick={() => setDialogOpen(true)}
            className="gap-2 bg-[#2E8B57] hover:bg-[#25734A] text-white"
          >
            <Plus className="w-4 h-4" />
            Post Notice
          </Button>
        )}
      </div>

      {notices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Bell className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No notices yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Published notices will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notices.map((notice) => (
            <Card key={notice.id} className="group hover:shadow-sm transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#2E8B57]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bell className="w-4 h-4 text-[#2E8B57]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-semibold">{notice.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {TARGET_LABELS[notice.targetType] ?? notice.targetType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          by {notice.createdByName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notice.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {canCreate && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setDeleteId(notice.id)}
                          className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap">
                  {notice.content}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Post New Notice</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Title <span className="text-red-500">*</span></Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Notice title"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Content <span className="text-red-500">*</span></Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Write your notice here..."
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Target Audience</Label>
                <Select
                  value={form.targetType}
                  onValueChange={(v) => setForm({ ...form, targetType: v, targetId: "" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Everyone</SelectItem>
                    <SelectItem value="CLASS">Specific Class</SelectItem>
                    <SelectItem value="ROLE">By Role</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.targetType === "CLASS" && (
                <div className="space-y-1.5">
                  <Label>Class</Label>
                  <Select
                    value={form.targetId}
                    onValueChange={(v) => setForm({ ...form, targetId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {form.targetType === "ROLE" && (
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Select
                    value={form.targetId}
                    onValueChange={(v) => setForm({ ...form, targetId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">Students</SelectItem>
                      <SelectItem value="TEACHER">Teachers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={loading}
              className="bg-[#2E8B57] hover:bg-[#25734A] text-white gap-2"
            >
              {loading && <Spinner className="w-4 h-4" />}
              Publish Notice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notice</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this notice for all recipients.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground gap-2"
            >
              {loading && <Spinner className="w-4 h-4" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
