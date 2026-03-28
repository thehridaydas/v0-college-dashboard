"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Search, LayoutDashboard, Users, UserCheck, BookOpen, CreditCard,
  Bell, BarChart2, Settings, GraduationCap, CalendarCheck, Star, UserCircle,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

interface NavItem {
  id: string
  title: string
  description: string
  href: string
  icon: React.ReactNode
  category: string
}

// Navigation map per role — pure client-side, no API needed
const NAV_ITEMS: Record<string, NavItem[]> = {
  ADMIN: [
    { id: "a-dashboard",  title: "Dashboard",   description: "Overview and key metrics",          href: "/dashboard/admin",           icon: <LayoutDashboard className="w-4 h-4" />, category: "Pages" },
    { id: "a-students",   title: "Students",     description: "Manage student records",            href: "/dashboard/admin/students",  icon: <GraduationCap   className="w-4 h-4" />, category: "Pages" },
    { id: "a-teachers",   title: "Teachers",     description: "Manage teaching staff",             href: "/dashboard/admin/teachers",  icon: <UserCheck       className="w-4 h-4" />, category: "Pages" },
    { id: "a-classes",    title: "Classes",      description: "View and manage classes",           href: "/dashboard/admin/classes",   icon: <BookOpen        className="w-4 h-4" />, category: "Pages" },
    { id: "a-subjects",   title: "Subjects",     description: "Manage course subjects",            href: "/dashboard/admin/subjects",  icon: <BookOpen        className="w-4 h-4" />, category: "Pages" },
    { id: "a-fees",       title: "Fees",         description: "Track and manage fee payments",     href: "/dashboard/admin/fees",      icon: <CreditCard      className="w-4 h-4" />, category: "Pages" },
    { id: "a-notices",    title: "Notices",      description: "Post and manage announcements",     href: "/dashboard/admin/notices",   icon: <Bell            className="w-4 h-4" />, category: "Pages" },
    { id: "a-analytics",  title: "Analytics",    description: "Institutional analytics overview",  href: "/dashboard/admin/analytics", icon: <BarChart2       className="w-4 h-4" />, category: "Pages" },
    { id: "a-settings",   title: "Settings",     description: "App and account settings",          href: "/dashboard/admin/settings",  icon: <Settings        className="w-4 h-4" />, category: "Pages" },
  ],
  TEACHER: [
    { id: "t-dashboard",   title: "Dashboard",   description: "Your teaching overview",            href: "/dashboard/teacher",             icon: <LayoutDashboard className="w-4 h-4" />, category: "Pages" },
    { id: "t-classes",     title: "Classes",     description: "View your assigned classes",        href: "/dashboard/teacher/classes",     icon: <BookOpen        className="w-4 h-4" />, category: "Pages" },
    { id: "t-attendance",  title: "Attendance",  description: "Mark and review attendance",        href: "/dashboard/teacher/attendance",  icon: <CalendarCheck   className="w-4 h-4" />, category: "Pages" },
    { id: "t-marks",       title: "Marks",       description: "Enter and manage student marks",    href: "/dashboard/teacher/marks",       icon: <Star            className="w-4 h-4" />, category: "Pages" },
    { id: "t-fees",        title: "Fees",        description: "Verify student fee payments",       href: "/dashboard/teacher/fees",        icon: <CreditCard      className="w-4 h-4" />, category: "Pages" },
    { id: "t-notices",     title: "Notices",     description: "View school announcements",         href: "/dashboard/teacher/notices",     icon: <Bell            className="w-4 h-4" />, category: "Pages" },
    { id: "t-profile",     title: "My Profile",  description: "View and edit your profile",        href: "/dashboard/teacher/profile",     icon: <UserCircle      className="w-4 h-4" />, category: "Pages" },
  ],
  STUDENT: [
    { id: "s-dashboard",   title: "Dashboard",   description: "Your student overview",             href: "/dashboard/student",             icon: <LayoutDashboard className="w-4 h-4" />, category: "Pages" },
    { id: "s-grades",      title: "Grades",      description: "View your marks and grades",        href: "/dashboard/student/grades",      icon: <Star            className="w-4 h-4" />, category: "Pages" },
    { id: "s-attendance",  title: "Attendance",  description: "Check your attendance record",      href: "/dashboard/student/attendance",  icon: <CalendarCheck   className="w-4 h-4" />, category: "Pages" },
    { id: "s-fees",        title: "Fees",        description: "View your fee status and history",  href: "/dashboard/student/fees",        icon: <CreditCard      className="w-4 h-4" />, category: "Pages" },
    { id: "s-notices",     title: "Notices",     description: "View school announcements",         href: "/dashboard/student/notices",     icon: <Bell            className="w-4 h-4" />, category: "Pages" },
    { id: "s-profile",     title: "My Profile",  description: "View and edit your profile",        href: "/dashboard/student/profile",     icon: <UserCircle      className="w-4 h-4" />, category: "Pages" },
  ],
  PRINCIPAL: [
    { id: "p-dashboard",   title: "Dashboard",   description: "Institutional overview",            href: "/dashboard/principal",              icon: <LayoutDashboard className="w-4 h-4" />, category: "Pages" },
    { id: "p-reports",     title: "Reports",     description: "Generate institutional reports",    href: "/dashboard/principal/reports",      icon: <BarChart2       className="w-4 h-4" />, category: "Pages" },
    { id: "p-analytics",   title: "Analytics",   description: "Deep analytics and insights",       href: "/dashboard/principal/analytics",    icon: <Users           className="w-4 h-4" />, category: "Pages" },
  ],
}

export function GlobalSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(0)
  const [isMac, setIsMac] = useState<boolean | undefined>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes("MAC") || navigator.userAgent.includes("Mac"))
  }, [])

  // Filter nav items for this role against the query — pure in-memory, instant
  const role = session?.user?.role ?? "STUDENT"
  const allItems = NAV_ITEMS[role] ?? []

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allItems
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
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

  // Close dropdown on route change
  useEffect(() => { setOpen(false); setQuery("") }, [pathname])

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
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)) }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)) }
    if (e.key === "Enter" && results[selected]) navigate(results[selected].href)
    if (e.key === "Escape") { setOpen(false); inputRef.current?.blur() }
  }

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
          onChange={(e) => { setQuery(e.target.value); setSelected(0) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Navigate to a page..."
          className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground text-foreground min-w-0"
        />
        {!query && isMac !== undefined && (
          <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground shrink-0">
            {isMac ? "⌘" : "Ctrl"} K
          </kbd>
        )}
      </div>

      {/* Dropdown — exact same width as input via w-full */}
      {open && (
        <div className="absolute top-full mt-1.5 left-0 w-full bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {results.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No pages match &quot;{query}&quot;
            </div>
          ) : (
            <>
              <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Pages
              </p>
              <ul className="pb-1.5 max-h-72 overflow-y-auto">
                {results.map((item, i) => (
                  <li key={item.id}>
                    <button
                      onClick={() => navigate(item.href)}
                      onMouseEnter={() => setSelected(i)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
                        selected === i ? "bg-accent" : "hover:bg-accent/50"
                      )}
                    >
                      <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                      </div>
                      {pathname === item.href && (
                        <span className="text-[10px] text-[#2E8B57] bg-[#2E8B57]/10 px-1.5 py-0.5 rounded shrink-0 font-medium">
                          Current
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  )
}
