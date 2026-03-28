import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

const VALID_ROLES = ["admin", "teacher", "student", "principal"]

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // If no token, redirect to login (withAuth handles this, but be explicit)
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    const role = (token.role as string).toLowerCase()
    const userDashboard = `/dashboard/${role}`

    // If the user is already authenticated and hits /login, send them to their dashboard.
    // This prevents the back button from returning to the login page.
    if (pathname === "/login") {
      return NextResponse.redirect(new URL(userDashboard, req.url))
    }

    // Validate that the URL is a known role prefix.
    // Unknown paths like /dashboard/dashboard or /dashboard/xyz redirect to own dashboard.
    const matchedRole = VALID_ROLES.find((r) => pathname.startsWith(`/dashboard/${r}`))
    if (!matchedRole) {
      return NextResponse.redirect(new URL(userDashboard, req.url))
    }

    // If the matched role doesn't belong to this user, redirect to their own dashboard.
    if (matchedRole !== role) {
      return NextResponse.redirect(new URL(userDashboard, req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // Allow middleware function to run for all matched routes (authenticated or not)
      authorized: () => true,
    },
  }
)

export const config = {
  // Include /login so authenticated users are redirected away from it
  matcher: ["/dashboard/:path*", "/login"],
}
