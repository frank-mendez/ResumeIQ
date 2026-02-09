import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe() {
  if (stripeInstance) return stripeInstance

  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable')
  }

  stripeInstance = new Stripe(secretKey, {
    apiVersion: '2026-01-28.clover',
    typescript: true,
  })

  return stripeInstance
}

export const STRIPE_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    credits: 3,
    features: ['3 resume analyses', 'Basic ATS scoring', 'Email support'],
  },
  PRO: {
    name: 'Pro',
    price: 1999, // $19.99 in cents
    priceId: 'price_pro_monthly', // Replace with actual Stripe price ID
    credits: 50,
    features: [
      'Unlimited resume analyses',
      'Advanced ATS scoring',
      'AI-powered suggestions',
      'Priority support',
      'Export reports',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 9999, // $99.99 in cents
    priceId: 'price_enterprise_monthly', // Replace with actual Stripe price ID
    credits: -1, // Unlimited
    features: [
      'Everything in Pro',
      'Team collaboration',
      'API access',
      'Custom integrations',
      'Dedicated support',
    ],
  },
} as const
