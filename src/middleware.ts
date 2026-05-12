import { NextResponse } from "next/server"
import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  const isAdminRoute = nextUrl.pathname.startsWith("/admin")
  const isAdminApiRoute = nextUrl.pathname.startsWith("/api/admin")

  if (isAdminRoute || isAdminApiRoute) {
    if (!isLoggedIn || (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN")) {
      return NextResponse.redirect(new URL("/login", nextUrl))
    }
  }

  // Handle specific vanity/typo redirect for /login/admin as requested
  if (nextUrl.pathname === "/login/admin") {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  return NextResponse.next()
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
