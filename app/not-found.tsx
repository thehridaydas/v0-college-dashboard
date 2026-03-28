"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

// Redirect authenticated users to their dashboard instead of showing a raw 404.
// Unauthenticated users are sent to /login (middleware then handles it from there).
export default function NotFound() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    if (session?.user?.role) {
      router.replace(`/dashboard/${session.user.role.toLowerCase()}`)
    } else {
      router.replace("/login")
    }
  }, [session, status, router])

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-3 bg-background text-foreground">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Redirecting...</p>
    </div>
  )
}
