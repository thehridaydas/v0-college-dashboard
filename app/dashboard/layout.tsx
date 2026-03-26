import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SessionProvider } from "@/components/session-provider"
import { DashboardShell } from "@/components/layout/dashboard-shell"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  return (
    <SessionProvider session={session}>
      <DashboardShell pageTitle="">
        {children}
      </DashboardShell>
    </SessionProvider>
  )
}
