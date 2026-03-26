"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardShellProps {
  children: React.ReactNode
  pageTitle: string
  notifications?: Array<{ id: string; title: string; description?: string; time?: string; read?: boolean }>
}

export function DashboardShell({ children, pageTitle, notifications = [] }: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          pageTitle={pageTitle}
          onMenuClick={() => setMobileOpen(true)}
          onSidebarToggle={() => setSidebarCollapsed((v) => !v)}
          sidebarCollapsed={sidebarCollapsed}
          notifications={notifications}
        />

        {/* Expand button when collapsed */}
        {sidebarCollapsed && (
          <div className="hidden lg:block absolute left-16 top-4 z-20">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(false)}
              className="h-7 w-7 rounded-md border border-border bg-background shadow-sm hover:bg-muted"
            >
              <PanelLeft className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-screen-2xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
