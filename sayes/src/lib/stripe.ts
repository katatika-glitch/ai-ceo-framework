import Stripe from 'stripe'

export function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

export const PLAN = {
  FREE_LIMIT: 2,
  get PRICE_ID() { return process.env.STRIPE_PRICE_ID! },
}
