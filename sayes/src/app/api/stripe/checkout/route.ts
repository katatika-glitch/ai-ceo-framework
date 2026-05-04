import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStripe, PLAN } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 既存のStripe顧客IDを取得
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('stripe_customer_id')
    .eq('id', session.user.id)
    .single()

  let customerId = user?.stripe_customer_id as string | undefined

  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: session.user.email,
      metadata: { userId: session.user.id },
    })
    customerId = customer.id

    await supabaseAdmin
      .from('users')
      .update({ stripe_customer_id: customerId })
      .eq('id', session.user.id)
  }

  const checkoutSession = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: PLAN.PRICE_ID, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/projects?upgraded=1`,
    cancel_url: `${process.env.NEXTAUTH_URL}/projects`,
    locale: 'ja',
  })

  return NextResponse.json({ url: checkoutSession.url })
}
