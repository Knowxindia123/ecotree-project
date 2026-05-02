import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()

  // Protect /admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Allow login page
    if (req.nextUrl.pathname === '/admin/login') {
      if (session) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url))
      }
      return res
    }
    // Redirect to login if no session
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // Protect /field routes
  if (req.nextUrl.pathname.startsWith('/field')) {
    if (!session) {
      return NextResponse.redirect(new URL('/field/login', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/field/:path*']
}
