"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Plus, Bell, Trash2, X, Search, Filter,
  CalendarDays, User2, Users2, BookOpen, ChevronLeft, ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { format, formatDistanceToNow } from "date-fns"

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

const PAGE_SIZE = 8

// Derive a display category + colour from targetType / targetId
function getCategory(notice: NoticeItem): { label: string; color: string } {
  if (notice.targetType === "ALL") return { label: "General", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" }
  if (notice.targetType === "ROLE") {
    if (notice.targetId === "STUDENT") return { label: "Students", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" }
    if (notice.targetId === "TEACHER") return { label: "Teachers", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" }
    return { label: "Role", color: "bg-muted text-muted-foreground" }
  }
  if (notice.targetType === "CLASS") return { label: "Class", color: "bg-[#2E8B57]/10 text-[#2E8B57] dark:bg-[#2E8B57]/20" }
  return { label: "Notice", color: "bg-muted text-muted-foreground" }
}

function getAudienceLabel(notice: NoticeItem) {
  if (notice.targetType === "ALL") return "Everyone"
  if (notice.targetType === "ROLE") return notice.targetId === "STUDENT" ? "All Students" : notice.targetId === "TEACHER" ? "All Teachers" : notice.targetId ?? "Role"
  if (notice.targetType === "CLASS") return `Class ${notice.targetId}`
  return "Unknown"
}

const FILTER_OPTIONS = ["All", "General", "Students", "Teachers", "Class"]
const SORT_OPTIONS = [
  { label: "Latest", value: "latest" },
  { label: "Oldest", value: "oldest" },
  { label: "A-Z", value: "az" },
]

const defaultForm = { title: "", content: "", targetType: "ALL", targetId: "" }

export function NoticesClient({ notices: initial, canCreate, classes = [] }: Props) {
  const router = useRouter()

  // List state
  const [notices, setNotices] = useState(initial)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("All")
  const [sort, setSort] = useState("latest")
  const [page, setPage] = useState(1)

  // Detail panel
  const [selected, setSelected] = useState<NoticeItem | null>(null)

  // Create / delete
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)

  // Filtering + sorting
  const filtered = useMemo(() => {
    let list = [...notices]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.createdByName.toLowerCase().includes(q))
    }
    if (filter !== "All") {
      list = list.filter((n) => getCategory(n).label === filter)
    }
    if (sort === "latest") list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    else if (sort === "oldest") list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    else if (sort === "az") list.sort((a, b) => a.title.localeCompare(b.title))
    return list
  }, [notices, search, filter, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleFilterChange = (val: string) => { setFilter(val); setPage(1) }
  const handleSortChange = (val: string) => { setSort(val); setPage(1) }
  const handleSearch = (val: string) => { setSearch(val); setPage(1) }

  const handleCreate = async () => {
    if (!form.title.trim() || !form.content.trim()) {
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
      if (selected?.id === deleteId) setSelected(null)
      setDeleteId(null)
    } catch {
      toast.error("Failed to delete notice")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-5 h-full items-start">

      {/* ── Left: list panel ── */}
      <div className={cn("flex flex-col gap-4 min-w-0 transition-all", selected ? "flex-1" : "w-full")}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
          <div>
            <h1 className="text-xl font-bold">Notice Board</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filtered.length} {filtered.length === 1 ? "notice" : "notices"}
            </p>
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

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search notices..."
              className="pl-8 h-8 text-sm"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <Select value={filter} onValueChange={handleFilterChange}>
              <SelectTrigger className="h-8 text-xs gap-1 w-36">
                <Filter className="w-3 h-3 text-muted-foreground shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FILTER_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o} className="text-xs">{o === "All" ? "All Categories" : o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="h-8 text-xs w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* List */}
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-card">
            <Bell className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No notices found</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="space-y-2">
            {paginated.map((notice) => {
              const cat = getCategory(notice)
              const isActive = selected?.id === notice.id
              return (
                <button
                  key={notice.id}
                  onClick={() => setSelected(isActive ? null : notice)}
                  className={cn(
                    "w-full text-left rounded-xl border bg-card px-4 py-3.5 transition-all hover:shadow-sm hover:border-[#2E8B57]/40 group",
                    isActive && "border-[#2E8B57] ring-1 ring-[#2E8B57]/20 shadow-sm"
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-9 h-9 rounded-lg bg-[#2E8B57]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bell className="w-4 h-4 text-[#2E8B57]" />
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="min-w-0">
                          <span className={cn("inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded mb-1", cat.color)}>
                            {cat.label}
                          </span>
                          <p className="text-sm font-semibold text-foreground leading-snug">{notice.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Users2 className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{getAudienceLabel(notice)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CalendarDays className="w-3 h-3" />
                            {format(new Date(notice.createdAt), "MMM d, yyyy")}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User2 className="w-3 h-3" />
                            {notice.createdByName}
                          </div>
                        </div>
                      </div>

                      {/* Preview snippet — hide when detail panel open to save space */}
                      {!selected && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                          {notice.content}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-1 shrink-0">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline" size="icon"
                className="h-7 w-7"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="icon"
                  className={cn("h-7 w-7 text-xs", p === page && "bg-[#2E8B57] hover:bg-[#25734A] text-white border-[#2E8B57]")}
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline" size="icon"
                className="h-7 w-7"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Right: detail panel ── */}
      {selected && (
        <div className="w-80 xl:w-96 shrink-0 sticky top-0">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
              <h2 className="text-sm font-semibold">Notice Detail</h2>
              <button
                onClick={() => setSelected(null)}
                className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Category badge */}
              <div>
                <span className={cn("inline-block text-[10px] font-semibold px-2 py-0.5 rounded", getCategory(selected).color)}>
                  {getCategory(selected).label}
                </span>
              </div>

              {/* Title & author */}
              <div>
                <h3 className="text-base font-bold leading-snug">{selected.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">by {selected.createdByName}</p>
              </div>

              {/* Metadata grid */}
              <div className="rounded-lg bg-muted/40 divide-y divide-border">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Users2 className="w-3.5 h-3.5" /> Audience
                  </span>
                  <span className="text-xs font-medium">{getAudienceLabel(selected)}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" /> Posted
                  </span>
                  <span className="text-xs font-medium">{format(new Date(selected.createdAt), "MMM d, yyyy · h:mm a")}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <User2 className="w-3.5 h-3.5" /> Posted by
                  </span>
                  <span className="text-xs font-medium">{selected.createdByName}</span>
                </div>
              </div>

              {/* Content */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> Content
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {selected.content}
                </p>
              </div>

              <p className="text-[10px] text-muted-foreground/60 pt-1">
                {formatDistanceToNow(new Date(selected.createdAt), { addSuffix: true })}
              </p>
            </div>

            {/* Action buttons — only for users who can manage notices */}
            {canCreate && (
              <div className="px-4 pb-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/5 hover:border-destructive"
                  onClick={() => setDeleteId(selected.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Notice
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Create Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Post New Notice</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Title <span className="text-destructive">*</span></Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Notice title"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Content <span className="text-destructive">*</span></Label>
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
                        <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
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

      {/* ── Delete Confirm ── */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notice</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this notice for all recipients. This action cannot be undone.
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
