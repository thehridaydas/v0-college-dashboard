"use client"

import { useState, useEffect } from "react"
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
  const last = segments[segments.length - 1]
  if (!last || last === "dashboard") return "Dashboard"
  return last
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

const SIDEBAR_KEY = "sidebar-collapsed"

export function DashboardShell({ children, pageTitle, notifications = [] }: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(SIDEBAR_KEY) === "true"
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const title = pageTitle || deriveTitle(pathname)

  const handleToggle = () => {
    setSidebarCollapsed((v) => {
      const next = !v
      localStorage.setItem(SIDEBAR_KEY, String(next))
      return next
    })
  }

  return (
    <div className={cn("flex h-screen bg-background overflow-hidden")}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleToggle}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          pageTitle={title}
          onMenuClick={() => setMobileOpen(true)}
          onSidebarToggle={handleToggle}
          sidebarCollapsed={sidebarCollapsed}
          notifications={notifications}
        />

        <main className="flex-1 overflow-y-auto min-h-0">
          <div className="p-3 md:p-4 h-full flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
