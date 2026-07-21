import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with cross-browser cookies across mobile browsers.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect all /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      // no user, redirect to login page
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    
    // Check if user is whitelisted
    const email = user.email
    const isMasterAdmin = email === process.env.MASTER_ADMIN_EMAIL

    if (!isMasterAdmin) {
      const { data: whitelisted, error } = await supabase
        .from('whitelisted_admins')
        .select('email')
        .eq('email', email)
        .single()
      
      if (!whitelisted || error) {
        // Force sign out so they don't get stuck in a loop
        await supabase.auth.signOut()
        
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('error', 'Access denied. Your email is not whitelisted.')
        return NextResponse.redirect(url)
      }
    }
  }

  // If user is logged in and tries to access /login, redirect to /admin ONLY IF THEY ARE WHITELISTED
  if (request.nextUrl.pathname === '/login' && user) {
    const email = user.email
    const isMasterAdmin = email === process.env.MASTER_ADMIN_EMAIL
    
    let isAllowed = isMasterAdmin
    if (!isMasterAdmin) {
      const { data: whitelisted } = await supabase
        .from('whitelisted_admins')
        .select('email')
        .eq('email', email)
        .single()
      isAllowed = !!whitelisted
    }

    if (isAllowed) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
