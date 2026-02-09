import { createFileRoute, Link } from '@tanstack/react-router'
import { STRIPE_PLANS } from '~/lib/stripe.server'
import { createCheckoutSession } from '~/utils/stripe.server'
import { useState } from 'react'

export const Route = createFileRoute('/pricing')({
  component: Pricing,
})

function Pricing() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (planType: 'PRO' | 'ENTERPRISE') => {
    setLoading(planType)
    try {
      const session = await createCheckoutSession({ data: { planType } })
      // Redirect to Stripe checkout
      window.location.href = session.url
    } catch (error: any) {
      alert('Failed to create checkout session: ' + error.message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Get started with ResumeIQ today. All plans include our core features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-bold mb-4">
              {STRIPE_PLANS.FREE.name}
            </h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">${STRIPE_PLANS.FREE.price}</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {STRIPE_PLANS.FREE.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/signup"
              className="block w-full text-center bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700"
            >
              Get Started
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-lg shadow-xl p-8 border-2 border-blue-600 relative">
            <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-sm rounded-bl-lg">
              Popular
            </div>
            <h3 className="text-2xl font-bold mb-4">
              {STRIPE_PLANS.PRO.name}
            </h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">
                ${(STRIPE_PLANS.PRO.price / 100).toFixed(2)}
              </span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {STRIPE_PLANS.PRO.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe('PRO')}
              disabled={loading === 'PRO'}
              className="block w-full text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading === 'PRO' ? 'Processing...' : 'Subscribe Now'}
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-bold mb-4">
              {STRIPE_PLANS.ENTERPRISE.name}
            </h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">
                ${(STRIPE_PLANS.ENTERPRISE.price / 100).toFixed(2)}
              </span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {STRIPE_PLANS.ENTERPRISE.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe('ENTERPRISE')}
              disabled={loading === 'ENTERPRISE'}
              className="block w-full text-center bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
            >
              {loading === 'ENTERPRISE' ? 'Processing...' : 'Subscribe Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
