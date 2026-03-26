import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    const role = token.role as string

    // Role-based routing
    if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL(`/dashboard/${role.toLowerCase()}`, req.url))
    }
    if (pathname.startsWith("/dashboard/teacher") && role !== "TEACHER") {
      return NextResponse.redirect(new URL(`/dashboard/${role.toLowerCase()}`, req.url))
    }
    if (pathname.startsWith("/dashboard/student") && role !== "STUDENT") {
      return NextResponse.redirect(new URL(`/dashboard/${role.toLowerCase()}`, req.url))
    }
    if (pathname.startsWith("/dashboard/principal") && role !== "PRINCIPAL") {
      return NextResponse.redirect(new URL(`/dashboard/${role.toLowerCase()}`, req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*"],
}
