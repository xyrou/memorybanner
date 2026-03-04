import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export const PRICES = {
  premium: 1300,      // $13.00 in cents
  premium_plus: 9900, // $99.00 in cents
}
