"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Search, LayoutDashboard, UserCheck, BookOpen, CreditCard,
  Bell, BarChart2, Settings, GraduationCap, CalendarCheck, Star, UserCircle,
  UserPlus, FilePlus, PlusCircle, Users, ClipboardList, DollarSign,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

interface SearchItem {
  id: string
  title: string
  description: string
  href: string
  icon: React.ReactNode
  category: "Pages" | "Actions"
  // Extra keywords so e.g. "add" matches all action items
  keywords?: string[]
}

// Full item map per role — pages + actions, pure client-side
const ALL_ITEMS: Record<string, SearchItem[]> = {
  ADMIN: [
    // Pages
    { id: "a-dashboard",  title: "Dashboard",         description: "Overview and key metrics",         href: "/dashboard/admin",           icon: <LayoutDashboard className="w-4 h-4" />, category: "Pages" },
    { id: "a-students",   title: "Students",           description: "Manage all student records",       href: "/dashboard/admin/students",  icon: <GraduationCap   className="w-4 h-4" />, category: "Pages" },
    { id: "a-teachers",   title: "Teachers",           description: "Manage teaching staff",            href: "/dashboard/admin/teachers",  icon: <UserCheck       className="w-4 h-4" />, category: "Pages" },
    { id: "a-classes",    title: "Classes",            description: "View and manage classes",          href: "/dashboard/admin/classes",   icon: <BookOpen        className="w-4 h-4" />, category: "Pages" },
    { id: "a-subjects",   title: "Subjects",           description: "Manage course subjects",           href: "/dashboard/admin/subjects",  icon: <BookOpen        className="w-4 h-4" />, category: "Pages" },
    { id: "a-fees",       title: "Fees",               description: "Track and manage fee payments",    href: "/dashboard/admin/fees",      icon: <CreditCard      className="w-4 h-4" />, category: "Pages" },
    { id: "a-notices",    title: "Notices",            description: "Post and manage announcements",    href: "/dashboard/admin/notices",   icon: <Bell            className="w-4 h-4" />, category: "Pages" },
    { id: "a-analytics",  title: "Analytics",          description: "Institutional analytics",          href: "/dashboard/admin/analytics", icon: <BarChart2       className="w-4 h-4" />, category: "Pages" },
    { id: "a-settings",   title: "Settings",           description: "App and account settings",         href: "/dashboard/admin/settings",  icon: <Settings        className="w-4 h-4" />, category: "Pages" },
    // Actions
    { id: "a-add-student",  title: "Add Student",      description: "Register a new student",           href: "/dashboard/admin/students?action=add",  icon: <UserPlus      className="w-4 h-4" />, category: "Actions", keywords: ["add", "new", "create", "register", "student"] },
    { id: "a-add-teacher",  title: "Add Teacher",      description: "Onboard a new teacher",            href: "/dashboard/admin/teachers?action=add",  icon: <UserPlus      className="w-4 h-4" />, category: "Actions", keywords: ["add", "new", "create", "onboard", "teacher"] },
    { id: "a-add-class",    title: "Add Class",        description: "Create a new class",               href: "/dashboard/admin/classes?action=add",   icon: <PlusCircle    className="w-4 h-4" />, category: "Actions", keywords: ["add", "new", "create", "class"] },
    { id: "a-add-subject",  title: "Add Subject",      description: "Create a new subject",             href: "/dashboard/admin/subjects?action=add",  icon: <PlusCircle    className="w-4 h-4" />, category: "Actions", keywords: ["add", "new", "create", "subject"] },
    { id: "a-add-fee",      title: "Add Fee Record",   description: "Create a new fee entry",           href: "/dashboard/admin/fees?action=add",      icon: <DollarSign    className="w-4 h-4" />, category: "Actions", keywords: ["add", "new", "create", "fee", "payment", "record"] },
    { id: "a-add-notice",   title: "Post Notice",      description: "Publish a new announcement",       href: "/dashboard/admin/notices?action=add",   icon: <FilePlus      className="w-4 h-4" />, category: "Actions", keywords: ["add", "new", "post", "create", "notice", "announcement"] },
  ],
  TEACHER: [
    // Pages
    { id: "t-dashboard",   title: "Dashboard",         description: "Your teaching overview",           href: "/dashboard/teacher",            icon: <LayoutDashboard className="w-4 h-4" />, category: "Pages" },
    { id: "t-classes",     title: "Classes",           description: "View your assigned classes",       href: "/dashboard/teacher/classes",    icon: <BookOpen        className="w-4 h-4" />, category: "Pages" },
    { id: "t-attendance",  title: "Attendance",        description: "Mark and review attendance",       href: "/dashboard/teacher/attendance", icon: <CalendarCheck   className="w-4 h-4" />, category: "Pages" },
    { id: "t-marks",       title: "Marks",             description: "Enter and manage student marks",   href: "/dashboard/teacher/marks",      icon: <Star            className="w-4 h-4" />, category: "Pages" },
    { id: "t-fees",        title: "Fees",              description: "Verify student fee payments",      href: "/dashboard/teacher/fees",       icon: <CreditCard      className="w-4 h-4" />, category: "Pages" },
    { id: "t-notices",     title: "Notices",           description: "View school announcements",        href: "/dashboard/teacher/notices",    icon: <Bell            className="w-4 h-4" />, category: "Pages" },
    { id: "t-profile",     title: "My Profile",        description: "View and edit your profile",       href: "/dashboard/teacher/profile",    icon: <UserCircle      className="w-4 h-4" />, category: "Pages" },
    // Actions
    { id: "t-mark-attend",  title: "Mark Attendance",  description: "Record today's attendance",        href: "/dashboard/teacher/attendance?action=mark", icon: <ClipboardList className="w-4 h-4" />, category: "Actions", keywords: ["mark", "add", "attendance", "record"] },
    { id: "t-add-marks",    title: "Add Marks",        description: "Enter marks for students",         href: "/dashboard/teacher/marks?action=add",       icon: <FilePlus      className="w-4 h-4" />, category: "Actions", keywords: ["add", "new", "enter", "marks", "grades"] },
    { id: "t-add-notice",   title: "Post Notice",      description: "Publish a new announcement",       href: "/dashboard/teacher/notices?action=add",     icon: <FilePlus      className="w-4 h-4" />, category: "Actions", keywords: ["add", "post", "notice", "announcement"] },
  ],
  STUDENT: [
    { id: "s-dashboard",   title: "Dashboard",         description: "Your student overview",            href: "/dashboard/student",            icon: <LayoutDashboard className="w-4 h-4" />, category: "Pages" },
    { id: "s-grades",      title: "Grades",            description: "View your marks and grades",       href: "/dashboard/student/grades",     icon: <Star            className="w-4 h-4" />, category: "Pages" },
    { id: "s-attendance",  title: "Attendance",        description: "Check your attendance record",     href: "/dashboard/student/attendance", icon: <CalendarCheck   className="w-4 h-4" />, category: "Pages" },
    { id: "s-fees",        title: "Fees",              description: "View your fee status and history", href: "/dashboard/student/fees",       icon: <CreditCard      className="w-4 h-4" />, category: "Pages" },
    { id: "s-notices",     title: "Notices",           description: "View school announcements",        href: "/dashboard/student/notices",    icon: <Bell            className="w-4 h-4" />, category: "Pages" },
    { id: "s-profile",     title: "My Profile",        description: "View and edit your profile",       href: "/dashboard/student/profile",    icon: <UserCircle      className="w-4 h-4" />, category: "Pages" },
  ],
  PRINCIPAL: [
    { id: "p-dashboard",   title: "Dashboard",         description: "Institutional overview",           href: "/dashboard/principal",             icon: <LayoutDashboard className="w-4 h-4" />, category: "Pages" },
    { id: "p-staff",       title: "Staff Overview",    description: "View all staff members",           href: "/dashboard/principal/staff",       icon: <Users           className="w-4 h-4" />, category: "Pages" },
    { id: "p-reports",     title: "Reports",           description: "Generate institutional reports",   href: "/dashboard/principal/reports",     icon: <BarChart2       className="w-4 h-4" />, category: "Pages" },
    { id: "p-analytics",   title: "Analytics",         description: "Deep analytics and insights",      href: "/dashboard/principal/analytics",   icon: <BarChart2       className="w-4 h-4" />, category: "Pages" },
  ],
}

export function GlobalSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  // -1 means nothing is highlighted (keyboard hasn't been used yet)
  const [selected, setSelected] = useState(-1)
  const [isMac, setIsMac] = useState<boolean | undefined>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes("MAC") || navigator.userAgent.includes("Mac"))
  }, [])

  const role = session?.user?.role ?? "STUDENT"
  const allItems = ALL_ITEMS[role] ?? []

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allItems
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.keywords?.some((kw) => kw.includes(q))
    )
  }, [query, allItems])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Close dropdown and reset on route change
  useEffect(() => { setOpen(false); setQuery(""); setSelected(-1) }, [pathname])

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  const navigate = (href: string) => {
    router.push(href)
    setOpen(false)
    setQuery("")
    setSelected(-1)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, results.length - 1))
    }
    if (e.key === "ArrowUp") {
      e.preventDefault()
      // Allow going back to -1 (no selection) when at the top
      setSelected((s) => Math.max(s - 1, -1))
    }
    if (e.key === "Enter" && selected >= 0 && results[selected]) {
      navigate(results[selected].href)
    }
    if (e.key === "Escape") { setOpen(false); inputRef.current?.blur() }
  }

  // Group filtered results by category for the dropdown
  const pages   = results.filter((r) => r.category === "Pages")
  const actions = results.filter((r) => r.category === "Actions")

  const renderItem = (item: SearchItem, globalIndex: number) => (
    <li key={item.id}>
      <button
        onClick={() => navigate(item.href)}
        onMouseEnter={() => setSelected(globalIndex)}
        onMouseLeave={() => setSelected(-1)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
          selected === globalIndex ? "bg-accent" : "hover:bg-accent/50"
        )}
      >
        <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
          {item.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{item.title}</p>
          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
        </div>
        {pathname === item.href.split("?")[0] && item.category === "Pages" && (
          <span className="text-[10px] text-[#2E8B57] bg-[#2E8B57]/10 px-1.5 py-0.5 rounded shrink-0 font-medium">
            Current
          </span>
        )}
      </button>
    </li>
  )

  return (
    <div ref={containerRef} className="relative w-96">
      {/* Search input */}
      <div className={cn(
        "flex items-center gap-2 h-9 px-3 rounded-lg border bg-muted/50 transition-all",
        open ? "border-[#2E8B57] ring-1 ring-[#2E8B57]/20 bg-background" : "border-border"
      )}>
        <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(-1) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search pages and actions..."
          className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground text-foreground min-w-0"
        />
        {!query && isMac !== undefined && (
          <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground shrink-0">
            {isMac ? "⌘" : "Ctrl"} K
          </kbd>
        )}
      </div>

      {/* Dropdown — same width as input */}
      {open && (
        <div className="absolute top-full mt-1.5 left-0 w-full bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {results.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No results for &quot;{query}&quot;
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto py-1.5">
              {pages.length > 0 && (
                <>
                  <p className="px-3 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Pages
                  </p>
                  <ul>
                    {pages.map((item) => renderItem(item, results.indexOf(item)))}
                  </ul>
                </>
              )}
              {actions.length > 0 && (
                <>
                  <p className={cn(
                    "px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
                    pages.length > 0 ? "pt-2 mt-1 border-t border-border" : "pt-1"
                  )}>
                    Actions
                  </p>
                  <ul>
                    {actions.map((item) => renderItem(item, results.indexOf(item)))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
