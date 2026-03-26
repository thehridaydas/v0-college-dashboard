"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  CreditCard,
  Bell,
  BarChart3,
  Settings,
  GraduationCap,
  ChevronRight,
  LogOut,
  UserCircle,
  BookMarked,
  UserCheck,
  Award,
  FileText,
  ChevronDown,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string | number
}

const navByRole: Record<string, NavItem[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Students", href: "/dashboard/admin/students", icon: GraduationCap },
    { label: "Teachers", href: "/dashboard/admin/teachers", icon: UserCheck },
    { label: "Classes", href: "/dashboard/admin/classes", icon: BookOpen },
    { label: "Subjects", href: "/dashboard/admin/subjects", icon: BookMarked },
    { label: "Fees", href: "/dashboard/admin/fees", icon: CreditCard },
    { label: "Notices", href: "/dashboard/admin/notices", icon: Bell },
    { label: "Analytics", href: "/dashboard/admin/analytics", icon: BarChart3 },
    { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  ],
  TEACHER: [
    { label: "Dashboard", href: "/dashboard/teacher", icon: LayoutDashboard },
    { label: "My Classes", href: "/dashboard/teacher/classes", icon: BookOpen },
    { label: "Attendance", href: "/dashboard/teacher/attendance", icon: ClipboardList },
    { label: "Marks", href: "/dashboard/teacher/marks", icon: Award },
    { label: "Fee Verification", href: "/dashboard/teacher/fees", icon: CreditCard },
    { label: "Notices", href: "/dashboard/teacher/notices", icon: Bell },
  ],
  STUDENT: [
    { label: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
    { label: "Grades", href: "/dashboard/student/grades", icon: Award },
    { label: "Attendance", href: "/dashboard/student/attendance", icon: ClipboardList },
    { label: "Fees", href: "/dashboard/student/fees", icon: CreditCard },
    { label: "Notices", href: "/dashboard/student/notices", icon: Bell },
    { label: "Profile", href: "/dashboard/student/profile", icon: UserCircle },
  ],
  PRINCIPAL: [
    { label: "Dashboard", href: "/dashboard/principal", icon: LayoutDashboard },
    { label: "Analytics", href: "/dashboard/principal/analytics", icon: BarChart3 },
    { label: "Reports", href: "/dashboard/principal/reports", icon: FileText },
  ],
}

const roleBadgeColor: Record<string, string> = {
  ADMIN: "bg-[#2E8B57]/20 text-[#2E8B57]",
  TEACHER: "bg-blue-500/20 text-blue-400",
  STUDENT: "bg-purple-500/20 text-purple-400",
  PRINCIPAL: "bg-amber-500/20 text-amber-400",
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role ?? "STUDENT"
  const navItems = navByRole[role] ?? []

  const initials = session?.user
    ? `${session.user.firstName?.[0] ?? ""}${session.user.lastName?.[0] ?? ""}`
    : "U"

  const handleSignOut = async () => {
    toast.promise(signOut({ callbackUrl: "/login" }), {
      loading: "Signing out...",
      success: "Signed out successfully",
      error: "Failed to sign out",
    })
  }

  const isActive = (href: string) => {
    if (href === `/dashboard/${role.toLowerCase()}`) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className={cn("flex items-center h-14 border-b border-sidebar-border px-3", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#2E8B57] flex items-center justify-center shrink-0">
              <GraduationCap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sidebar-foreground truncate text-sm">EduManage</span>
          </Link>
        )}
        <button
          onClick={onToggle}
          className="w-7 h-7 rounded-md hover:bg-sidebar-accent flex items-center justify-center transition-colors shrink-0"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronRight className={cn("w-4 h-4 text-sidebar-foreground/60 transition-transform duration-300", !collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-2">
          <span className={cn("text-xs font-semibold px-2 py-1 rounded-md", roleBadgeColor[role])}>
            {role}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Tooltip key={item.href} disableHoverableContent={!collapsed}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    onClick={onMobileClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                      active
                        ? "bg-[#2E8B57] text-white"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 shrink-0", active ? "text-white" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground")} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="ml-auto text-xs bg-white/20 rounded-full px-1.5 py-0.5 leading-none">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="bg-sidebar-accent text-sidebar-foreground border-sidebar-border">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </TooltipProvider>
      </nav>

      {/* Bottom: Profile */}
      <div className="border-t border-sidebar-border p-2">
        {collapsed ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full flex items-center justify-center p-2 rounded-lg">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-[#2E8B57] text-white text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-sidebar-accent text-sidebar-foreground border-sidebar-border">
                {session?.user?.firstName} {session?.user?.lastName}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors group">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-[#2E8B57] text-white text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-sidebar-foreground truncate leading-none">
                    {session?.user?.firstName} {session?.user?.lastName}
                  </p>
                  <p className="text-xs text-sidebar-foreground/50 truncate mt-0.5 leading-none">
                    {session?.user?.email}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-sidebar-foreground/40 shrink-0 group-hover:text-sidebar-foreground/60 transition-colors" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="top"
              sideOffset={8}
              className="w-56 bg-sidebar border-sidebar-border"
            >
              <DropdownMenuLabel className="text-sidebar-foreground/60 text-xs font-normal">
                {session?.user?.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-sidebar-border" />
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/${role.toLowerCase()}/profile`}
                  className="flex items-center gap-2 text-sidebar-foreground cursor-pointer"
                >
                  <UserCircle className="w-4 h-4" />
                  Manage Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-sidebar-border" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="flex items-center gap-2 text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen sticky top-0 border-r border-sidebar-border transition-all duration-300 shrink-0",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 shadow-2xl">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  )
}
