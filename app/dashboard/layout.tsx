// Auth is handled by middleware — no async session check here so this renders instantly
import { SessionProvider } from "@/components/session-provider"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider session={null}>
      {children}
    </SessionProvider>
  )
}
