import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

const VALID_ROLES = ["admin", "teacher", "student", "principal"]

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // No token — unauthenticated user.
    // If they're hitting /login, let them through. Otherwise send to /login.
    if (!token) {
      if (pathname === "/login") return NextResponse.next()
      return NextResponse.redirect(new URL("/login", req.url))
    }

    const role = (token.role as string).toLowerCase()
    const userDashboard = `/dashboard/${role}`

    // Authenticated user hitting /login → send to their dashboard (prevents back-button loop).
    if (pathname === "/login") {
      return NextResponse.redirect(new URL(userDashboard, req.url))
    }

    // Unknown dashboard path (e.g. /dashboard/dashboard, /dashboard/xyz) → own dashboard.
    const matchedRole = VALID_ROLES.find((r) => pathname.startsWith(`/dashboard/${r}`))
    if (!matchedRole) {
      return NextResponse.redirect(new URL(userDashboard, req.url))
    }

    // Wrong role in URL (e.g. admin visiting /dashboard/student) → own dashboard.
    if (matchedRole !== role) {
      return NextResponse.redirect(new URL(userDashboard, req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // Let the middleware function above handle all auth logic itself.
      authorized: () => true,
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}
