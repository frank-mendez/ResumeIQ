import { createFileRoute } from '@tanstack/react-router'
import { getUserResumes } from '~/utils/resume.server'
import { getUserSubscription } from '~/utils/stripe.server'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/_authenticated/dashboard/')({
  component: DashboardIndex,
})

function DashboardIndex() {
  const { user } = Route.useRouteContext()

  const { data: resumes, isLoading: resumesLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => getUserResumes(),
  })

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => getUserSubscription(),
  })

  if (resumesLoading || subLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-600 text-sm mb-2">Total Resumes</h3>
          <p className="text-3xl font-bold text-blue-600">
            {resumes?.length || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-600 text-sm mb-2">Current Plan</h3>
          <p className="text-3xl font-bold text-green-600">
            {subscription?.plan_type || 'FREE'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-600 text-sm mb-2">Analyses Run</h3>
          <p className="text-3xl font-bold text-purple-600">0</p>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Welcome back, {user?.email}!
        </h2>
        <p className="text-gray-700">
          Ready to analyze your resume? Upload a new resume to get started with
          AI-powered insights.
        </p>
      </div>

      {/* Recent Resumes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Resumes</h2>
        {resumes && resumes.length > 0 ? (
          <div className="space-y-3">
            {resumes.slice(0, 5).map((resume) => (
              <div
                key={resume.id}
                className="flex justify-between items-center p-3 border rounded hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium">{resume.filename}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(resume.created_at).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={`/dashboard/resumes/${resume.id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  View →
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">
            No resumes yet.{' '}
            <a href="/dashboard/upload" className="text-blue-600 hover:underline">
              Upload your first resume
            </a>{' '}
            to get started.
          </p>
        )}
      </div>
    </div>
  )
}
