import { createServerClient as create } from '@supabase/ssr'
import { createClient as createService } from '@supabase/supabase-js'
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

export function createServerClient(cookieStore: ReadonlyRequestCookies) {
  return create(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookies) {
          // RSCs can't set cookies — no-op here. Middleware handles refresh.
          void cookies
        },
      },
    }
  )
}

export function createServiceClient() {
  // Server-only. Bypasses RLS. Used by API routes and admin server actions.
  return createService(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
