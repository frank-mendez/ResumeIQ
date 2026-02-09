import { createFileRoute } from '@tanstack/react-router'
import { getResumeAnalyses } from '~/utils/resume.server'
import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '~/components/LoadingSpinner'
import { createSupabaseServerClient } from '~/lib/supabase.server'

export const Route = createFileRoute(
  '/_authenticated/dashboard/resumes/$resumeId'
)({
  component: ResumeDetail,
  loader: async ({ params, context }) => {
    const supabase = createSupabaseServerClient(context.request.headers)
    const { data: resume } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', params.resumeId)
      .single()

    return { resume }
  },
})

function ResumeDetail() {
  const { resume } = Route.useLoaderData()
  const { resumeId } = Route.useParams()

  const { data: analyses, isLoading } = useQuery({
    queryKey: ['analyses', resumeId],
    queryFn: () => getResumeAnalyses({ data: { resumeId } }),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  const latestAnalysis = analyses?.[0]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{resume?.filename}</h1>
        <p className="text-gray-600">
          Uploaded: {resume?.created_at && new Date(resume.created_at).toLocaleDateString()}
        </p>
      </div>

      {latestAnalysis ? (
        <div className="space-y-6">
          {/* ATS Score */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">ATS Compatibility Score</h2>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold text-blue-600">
                {latestAnalysis.ats_score}
              </div>
              <div>
                <p className="text-gray-700">out of 100</p>
                <div className="w-64 bg-gray-200 rounded-full h-3 mt-2">
                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: `${latestAnalysis.ats_score}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Strengths */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-700">
              ✓ Strengths
            </h2>
            <ul className="space-y-2">
              {latestAnalysis.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-orange-700">
              ⚠ Areas for Improvement
            </h2>
            <ul className="space-y-2">
              {latestAnalysis.weaknesses.map((weakness, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">⚠</span>
                  <span className="text-gray-700">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Suggestions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-700">
              💡 Suggestions
            </h2>
            <ul className="space-y-3">
              {latestAnalysis.suggestions.map((suggestion, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">💡</span>
                  <span className="text-gray-700">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Keywords */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">🔑 Key Skills & Keywords</h2>
            <div className="flex flex-wrap gap-2">
              {latestAnalysis.keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold mb-2">No analysis available</h3>
          <p className="text-gray-600">
            This resume hasn't been analyzed yet. Try re-uploading or contact support.
          </p>
        </div>
      )}
    </div>
  )
}
