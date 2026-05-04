"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import useSWR from "swr"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface DashboardShellProps {
  children: React.ReactNode
  pageTitle?: string
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

export function DashboardShell({ children, pageTitle }: DashboardShellProps) {
  // Start with false on both server and client to avoid hydration mismatch.
  // Read localStorage only after mount in useEffect.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const title = pageTitle || deriveTitle(pathname)

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY)
    if (stored === "true") setSidebarCollapsed(true)
  }, [])

  // Fetch unread notices for the notification bell — runs client-side only.
  const { data: noticesData } = useSWR("/api/notices", fetcher, { refreshInterval: 60_000 })
  const notifications = (noticesData?.notices ?? [])
    .filter((n: any) => !n.recipients?.[0]?.isRead)
    .slice(0, 10)
    .map((n: any) => ({
      id: n.id,
      title: n.title,
      description: n.content?.slice(0, 80),
      time: new Date(n.createdAt).toLocaleDateString(),
      read: n.recipients?.[0]?.isRead ?? false,
    }))

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
          <div className="p-3 pb-8 md:p-6 md:pb-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
