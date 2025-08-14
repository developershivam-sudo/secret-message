import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
export { default } from "next-auth/middleware"

export async function middleware(request: NextRequest) {

  const token = await getToken({req: request})
  const url = request.nextUrl

  if (token && (
    url.pathname.startsWith('/') ||
    url.pathname.startsWith('/sign-in') ||
    url.pathname.startsWith('/sign-up') ||
    url.pathname.startsWith('/verify')
  )) {
    return NextResponse.redirect(new URL("/dashboard", request.url))      
  }

  // If user is not logged in and tries to access protected pages → send to sign-in
  if (!token && (
    url.pathname.startsWith('/dashboard') ||
    url.pathname.startsWith('/verify')
  )) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  return NextResponse.next()
}

// Matching Paths
export const config = {
  matcher: [
    '/',
    '/sign-in',
    '/sign-up',
    '/dashboard/:path*',
    '/verify/:path*'
  ]
}