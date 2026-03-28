"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

// Redirect authenticated users to their dashboard instead of showing a 404.
// Unauthenticated users are sent to login.
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

  return null
}
