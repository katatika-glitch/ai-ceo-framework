import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: projects, count } = await supabaseAdmin
    .from('projects')
    .select('id, title, description, netlify_url, status, created_at', { count: 'exact' })
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ projects: projects ?? [], count: count ?? 0 })
}
