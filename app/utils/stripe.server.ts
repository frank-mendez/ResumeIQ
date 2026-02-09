import { createServerFn } from '@tanstack/start'
import { z } from 'zod'
import { getStripe, STRIPE_PLANS } from '~/lib/stripe.server'
import { createSupabaseServerClient } from '~/lib/supabase.server'

// Schema for creating checkout session
const createCheckoutSchema = z.object({
  planType: z.enum(['PRO', 'ENTERPRISE']),
})

// Server function to create Stripe checkout session
export const createCheckoutSession = createServerFn({ method: 'POST' })
  .validator(createCheckoutSchema)
  .handler(async ({ data, context }) => {
    const headers = context.request.headers
    const supabase = createSupabaseServerClient(headers)
    const stripe = getStripe()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const plan = STRIPE_PLANS[data.planType]

    // TODO: In production, implement actual Stripe checkout session creation
    // This is a stub that returns a mock session
    const mockSession = {
      id: 'cs_test_' + Math.random().toString(36).substring(7),
      url: 'https://checkout.stripe.com/mock-checkout-url',
      customer: 'cus_' + Math.random().toString(36).substring(7),
      mode: 'subscription',
      status: 'open',
    }

    /* 
    // Production implementation would look like:
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.VITE_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.VITE_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        planType: data.planType,
      },
    })
    */

    return mockSession
  })

// Server function to handle Stripe webhook
export const handleStripeWebhook = createServerFn({ method: 'POST' }).handler(
  async ({ context }) => {
    const stripe = getStripe()
    const supabase = createSupabaseServerClient(context.request.headers)

    // Get the webhook signature
    const signature = context.request.headers.get('stripe-signature')
    if (!signature) {
      throw new Error('Missing stripe-signature header')
    }

    // Get raw body
    const rawBody = await context.request.text()

    // TODO: In production, verify webhook signature and process events
    // This is a stub that acknowledges the webhook
    
    /*
    // Production implementation would look like:
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (err: any) {
      throw new Error(`Webhook signature verification failed: ${err.message}`)
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        // Create or update subscription in database
        await supabase.from('subscriptions').upsert({
          user_id: session.metadata?.userId!,
          stripe_subscription_id: session.subscription as string,
          stripe_customer_id: session.customer as string,
          status: 'active',
          plan_type: session.metadata?.planType!,
        })
        break

      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription
        // Update subscription status
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq('stripe_subscription_id', subscription.id)
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        // Mark subscription as canceled
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', deletedSubscription.id)
        break

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        // Record payment
        await supabase.from('payments').insert({
          user_id: paymentIntent.metadata?.userId!,
          stripe_payment_intent_id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
        })
        break
    }
    */

    return { received: true }
  }
)

// Server function to get user subscription
export const getUserSubscription = createServerFn({ method: 'GET' }).handler(
  async ({ context }) => {
    const headers = context.request.headers
    const supabase = createSupabaseServerClient(headers)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      // No subscription found, return free plan
      return {
        plan_type: 'FREE',
        status: 'active',
      }
    }

    return subscription
  }
)

// Server function to cancel subscription
export const cancelSubscription = createServerFn({ method: 'POST' }).handler(
  async ({ context }) => {
    const headers = context.request.headers
    const supabase = createSupabaseServerClient(headers)
    const stripe = getStripe()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error || !subscription) {
      throw new Error('No subscription found')
    }

    // TODO: In production, cancel the Stripe subscription
    /*
    if (subscription.stripe_subscription_id) {
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true,
      })
    }
    */

    // Update local subscription
    await supabase
      .from('subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('id', subscription.id)

    return { success: true }
  }
)
