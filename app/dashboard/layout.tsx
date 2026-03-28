// Auth is handled by middleware — this layout is intentionally minimal.
// SessionProvider lives at the root layout level.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
