import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'

export default async function RootPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/lp')
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', session.user.id)
    .single()

  if (!profile) {
    redirect('/onboarding')
  }

  redirect('/session')
}
