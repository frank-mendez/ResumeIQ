import { createFileRoute } from '@tanstack/react-router'
import { getUserResumes } from '~/utils/resume.server'
import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '~/components/LoadingSpinner'

export const Route = createFileRoute('/_authenticated/dashboard/resumes' as any)({
  component: Resumes,
})

function Resumes() {
  const { data: resumes, isLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => getUserResumes(),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Resumes</h1>
        <a
          href="/dashboard/upload"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Upload New Resume
        </a>
      </div>

      {resumes && resumes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume: any) => (
            <div
              key={resume.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-2">{resume.filename}</h3>
                <p className="text-sm text-gray-600">
                  Uploaded: {new Date(resume.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  Size: {(resume.file_size / 1024).toFixed(2)} KB
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`/dashboard/resumes/${resume.id}`}
                  className="flex-1 text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 text-sm"
                >
                  View Analysis
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold mb-2">No resumes yet</h3>
          <p className="text-gray-600 mb-6">
            Upload your first resume to get started with AI-powered analysis
          </p>
          <a
            href="/dashboard/upload"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Upload Resume
          </a>
        </div>
      )}
    </div>
  )
}
