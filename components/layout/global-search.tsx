"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, GraduationCap, UserCheck, BookOpen, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string
  type: "student" | "teacher" | "class"
  title: string
  subtitle: string
  href: string
}

export function GlobalSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.results ?? [])
      }
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, search])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)) }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)) }
    if (e.key === "Enter" && results[selected]) {
      router.push(results[selected].href)
      setOpen(false)
      setQuery("")
    }
    if (e.key === "Escape") { setOpen(false); inputRef.current?.blur() }
  }

  const typeIcon = (type: string) => {
    if (type === "student") return <GraduationCap className="w-4 h-4 text-purple-500" />
    if (type === "teacher") return <UserCheck className="w-4 h-4 text-blue-500" />
    return <BookOpen className="w-4 h-4 text-indigo-500" />
  }

  const typeLabel = (type: string) => {
    if (type === "student") return "Student"
    if (type === "teacher") return "Teacher"
    return "Class"
  }

  return (
    <div ref={containerRef} className="relative w-64">
      <div className={cn(
        "flex items-center gap-2 h-8 px-3 rounded-lg border bg-muted/50 transition-all",
        open ? "border-[#2E8B57] ring-1 ring-[#2E8B57]/20 bg-background" : "border-border"
      )}>
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 text-muted-foreground shrink-0 animate-spin" />
        ) : (
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setSelected(0) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground text-foreground min-w-0"
        />
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute top-full mt-1.5 left-0 w-80 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {loading ? (
            <div className="py-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No results for &quot;{query}&quot;
            </div>
          ) : (
            <ul className="py-1 max-h-72 overflow-y-auto">
              {results.map((r, i) => (
                <li key={r.id}>
                  <button
                    onClick={() => { router.push(r.href); setOpen(false); setQuery("") }}
                    onMouseEnter={() => setSelected(i)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                      selected === i ? "bg-accent" : "hover:bg-accent/50"
                    )}
                  >
                    <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                      {typeIcon(r.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.subtitle}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                      {typeLabel(r.type)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
