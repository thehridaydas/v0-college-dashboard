"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // Do not pass a session prop — NextAuth reads it from the cookie automatically.
  // Passing session={null} would override the cookie and break useSession() for all clients.
  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  )
}
