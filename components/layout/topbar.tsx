"use client"

import { Menu, Bell, Sun, Moon, Search } from "lucide-react"
import { useTheme } from "next-themes"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TopbarProps {
  pageTitle: string
  onMenuClick: () => void
  onSidebarToggle: () => void
  sidebarCollapsed: boolean
  notifications?: Array<{ id: string; title: string; description?: string; time?: string; read?: boolean }>
}

export function Topbar({ pageTitle, onMenuClick, notifications = [] }: TopbarProps) {
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 gap-3 sticky top-0 z-30">
      {/* Mobile menu */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="lg:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
      >
        <Menu className="w-4 h-4" />
        <span className="sr-only">Open menu</span>
      </Button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-foreground truncate">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Search shortcut */}
        <button className="hidden md:flex items-center gap-2 h-8 px-3 rounded-lg border border-border bg-muted/50 text-xs text-muted-foreground hover:bg-muted transition-colors">
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
          <kbd className="ml-2 text-[10px] font-mono bg-background border border-border rounded px-1 py-0.5">⌘K</kbd>
        </button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 relative text-muted-foreground hover:text-foreground">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#2E8B57] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No notifications</div>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <DropdownMenuItem key={n.id} className={cn("flex flex-col items-start gap-1 p-3", !n.read && "bg-accent/50")}>
                  <div className="flex items-center gap-2 w-full">
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#2E8B57] shrink-0" />}
                    <span className="font-medium text-sm truncate flex-1">{n.title}</span>
                    {n.time && <span className="text-xs text-muted-foreground shrink-0">{n.time}</span>}
                  </div>
                  {n.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 pl-3.5">{n.description}</p>
                  )}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Sun className="w-4 h-4 hidden dark:block" />
          <Moon className="w-4 h-4 dark:hidden" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Role badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border">
          <span className="text-xs font-medium text-muted-foreground capitalize">
            {session?.user?.role?.toLowerCase()}
          </span>
        </div>
      </div>
    </header>
  )
}
