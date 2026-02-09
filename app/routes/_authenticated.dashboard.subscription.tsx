import { createFileRoute } from '@tanstack/react-router'
import { getUserSubscription, cancelSubscription } from '~/utils/stripe.server'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LoadingSpinner } from '~/components/LoadingSpinner'
import { STRIPE_PLANS } from '~/lib/stripe.server'

export const Route = createFileRoute(
  '/_authenticated/dashboard/subscription' as any
)({
  component: Subscription,
})

function Subscription() {
  const queryClient = useQueryClient()

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => getUserSubscription(),
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      alert('Subscription cancelled successfully')
    },
    onError: (error: any) => {
      alert('Failed to cancel subscription: ' + error.message)
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  const planType = subscription?.plan_type || 'FREE'
  const plan =
    STRIPE_PLANS[planType as keyof typeof STRIPE_PLANS] || STRIPE_PLANS.FREE

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Subscription</h1>

      <div className="max-w-2xl">
        {/* Current Plan */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-bold text-blue-600">{plan.name}</p>
              {planType !== 'FREE' && (
                <p className="text-gray-600">
                  ${(plan.price / 100).toFixed(2)}/month
                </p>
              )}
            </div>
            {subscription?.status && (
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  subscription.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {subscription.status}
              </span>
            )}
          </div>

          {subscription?.current_period_end && (
            <p className="text-sm text-gray-600 mb-4">
              {subscription.cancel_at_period_end
                ? 'Cancels on: '
                : 'Renews on: '}
              {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
          )}

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Plan Features:</h3>
            <ul className="space-y-2">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        {planType === 'FREE' ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold mb-2">Upgrade Your Plan</h3>
            <p className="text-gray-700 mb-4">
              Get more features and unlimited analyses with our Pro or
              Enterprise plans.
            </p>
            <a
              href="/pricing"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              View Plans
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-2">Manage Subscription</h3>
              <p className="text-gray-700 mb-4">
                Need to make changes to your subscription?
              </p>
              <div className="flex gap-3">
                <a
                  href="/pricing"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Change Plan
                </a>
                {!subscription?.cancel_at_period_end && (
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          'Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.'
                        )
                      ) {
                        cancelMutation.mutate()
                      }
                    }}
                    disabled={cancelMutation.isPending}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Subscription'}
                  </button>
                )}
              </div>
            </div>

            {subscription?.cancel_at_period_end && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  Your subscription is scheduled to cancel at the end of the
                  current billing period. You'll be downgraded to the Free plan.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
