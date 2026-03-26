"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { cn } from "@/lib/utils"

interface DashboardShellProps {
  children: React.ReactNode
  pageTitle?: string
  notifications?: Array<{ id: string; title: string; description?: string; time?: string; read?: boolean }>
}

function deriveTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean)
  // e.g. ["dashboard", "admin", "students"] → "Students"
  const last = segments[segments.length - 1]
  if (!last || last === "dashboard") return "Dashboard"
  return last
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

export function DashboardShell({ children, pageTitle, notifications = [] }: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const title = pageTitle || deriveTitle(pathname)

  return (
    <div className={cn("flex h-screen bg-background overflow-hidden")}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          pageTitle={title}
          onMenuClick={() => setMobileOpen(true)}
          onSidebarToggle={() => setSidebarCollapsed((v) => !v)}
          sidebarCollapsed={sidebarCollapsed}
          notifications={notifications}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-screen-2xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
