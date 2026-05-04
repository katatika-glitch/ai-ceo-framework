import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { work_style, industry, side_job_goal, tech_level, weekly_hours } = body

  const { error } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: session.user.id,
      work_style,
      industry,
      side_job_goal,
      tech_level,
      weekly_hours,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return NextResponse.json({ profile: data })
}
