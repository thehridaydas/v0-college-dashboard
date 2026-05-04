"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow, isSameDay, isSameMonth, isToday, format } from "date-fns"

interface Notice {
  id: string
  title: string
  createdAt: string
}

interface Props {
  notices: Notice[]
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export function DashboardCalendar({ notices }: Props) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  // Build day grid — prefix empty slots for alignment
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  // Pad to complete the last row
  while (cells.length % 7 !== 0) cells.push(null)

  // Map notice dates for dot indicators
  const noticeDates = new Set(
    notices.map((n) => {
      const d = new Date(n.createdAt)
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    })
  )

  const hasNotice = (day: number) =>
    noticeDates.has(`${year}-${month}-${day}`)

  const prevMonth = () =>
    setViewDate(new Date(year, month - 1, 1))

  const nextMonth = () =>
    setViewDate(new Date(year, month + 1, 1))

  // Upcoming notices — sorted by date, show next 5
  const upcoming = [...notices]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-4 w-64 shrink-0">
      {/* Calendar card */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-foreground">
            {MONTHS[month]} {year}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={nextMonth}
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Next month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-0.5">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} />
            }

            const cellDate = new Date(year, month, day)
            const isCurrentDay = isToday(cellDate)
            const isCurrentMonth = isSameMonth(cellDate, viewDate)
            const hasDot = hasNotice(day)

            return (
              <div key={day} className="flex flex-col items-center gap-0.5 py-0.5">
                <div
                  className={cn(
                    "w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium transition-colors",
                    isCurrentDay
                      ? "bg-[#2E8B57] text-white font-semibold"
                      : isCurrentMonth
                      ? "text-foreground hover:bg-muted cursor-default"
                      : "text-muted-foreground/40"
                  )}
                >
                  {day}
                </div>
                {/* Notice dot indicator */}
                <div className={cn("w-1 h-1 rounded-full", hasDot ? "bg-[#2E8B57]" : "invisible")} />
              </div>
            )
          })}
        </div>

        {/* Today shortcut */}
        {!isSameMonth(today, viewDate) && (
          <button
            onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="mt-3 w-full text-[11px] text-[#2E8B57] hover:underline text-center"
          >
            Back to today
          </button>
        )}
      </div>

      {/* Upcoming notices card */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-foreground">Upcoming Notices</span>
          <Bell className="w-3.5 h-3.5 text-muted-foreground" />
        </div>

        {upcoming.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No notices yet</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((n) => {
              const d = new Date(n.createdAt)
              return (
                <div key={n.id} className="flex items-start gap-2.5">
                  {/* Date badge */}
                  <div className="shrink-0 flex flex-col items-center justify-center w-9 h-9 rounded-lg bg-[#2E8B57]/10 text-[#2E8B57]">
                    <span className="text-[10px] font-semibold leading-none">{format(d, "MMM").toUpperCase()}</span>
                    <span className="text-sm font-bold leading-none mt-0.5">{format(d, "d")}</span>
                  </div>
                  {/* Text */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-xs font-medium text-foreground line-clamp-2 leading-relaxed">{n.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDistanceToNow(d, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
