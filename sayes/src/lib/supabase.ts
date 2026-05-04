import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export const supabase = new Proxy({} as ReturnType<typeof getSupabase>, {
  get: (_, prop) => getSupabase()[prop as keyof ReturnType<typeof getSupabase>],
})

export const supabaseAdmin = new Proxy({} as ReturnType<typeof getSupabaseAdmin>, {
  get: (_, prop) => getSupabaseAdmin()[prop as keyof ReturnType<typeof getSupabaseAdmin>],
})
